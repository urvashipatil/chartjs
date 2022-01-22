const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const cors = require("cors");
// const sql = require("mssql");
const app = express();
const port = 3000;

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./public")));

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// const sqlConfig = {
//   user: "sa",
//   password: "sa123",
//   server: "localhost",
//   database: "feedback",
// };

app.get("/pagewisecount", async (req, res) => {
  //   sql.connect(sqlConfig, (err) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log("DB conected");
  //     }
  //   });

  let response = await db.query(
    ` select SCREEN_FROM , count(*) noOfFeedbacks from PARTY_FEEDBACK_HDR hdr  
    group by SCREEN_FROM `,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("/getpercentage", async (req, res) => {
  let response = await db.query(
    `select t.TotalRating,count(*) count, round((count(*)/(select count(*) noOfFeedbacks from PARTY_FEEDBACK_HDR))*100) percentage from (
          select   hdr.DATE_CREATED ,
            case when sum(opt.Rating)>7 then "Positive"  when sum(opt.Rating)>3 and sum(opt.Rating)<=7 then "Neutral" else "Negative" end TotalRating
          from PARTY_FEEDBACK_HDR hdr
          inner join PARTY_FEEDBACK_DTL dtl
          on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
          inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
          on dtl.OPTION_ID = opt.OPTION_ID 
          group by hdr.PRTY_FEEDBACK_HDR_ID,hdr.DATE_CREATED  ) t
        group by t.TotalRating `,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

// app.get("/pagewisecount", async (req, res) => {
//   //   sql.connect(sqlConfig, (err) => {
//   //     if (err) {
//   //       console.log(err);
//   //     } else {
//   //       console.log("DB conected");
//   //     }
//   //   });

//   let response = await db.query(
//     `select SCREEN_FROM,  count(*) count
//   from PARTY_FEEDBACK_HDR hdr
//   inner join PARTY_FEEDBACK_DTL dtl
//   on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
//   inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
//   on dtl.OPTION_ID = opt.OPTION_ID
//    group by SCREEN_FROM `,
//     {
//       type: db.QueryTypes.SELECT,
//     }
//   );
//   console.log(response);
//   res.send(response);
// });

app.get("/page/:pagename", async (req, res) => {
  console.log("req.body", req.params.pagename);
  let response = await db.query(
    `select SCREEN_FROM,t.TotalRating,count(*) count from (
      select SCREEN_FROM,hdr.PRTY_FEEDBACK_HDR_ID  ,
      case when sum(opt.Rating)>7 then "Positive"  when sum(opt.Rating)>3 and sum(opt.Rating)<=7 then "Neutral" else "Negative" end TotalRating
        from PARTY_FEEDBACK_HDR hdr
        inner join PARTY_FEEDBACK_DTL dtl
        on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
        inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
        on dtl.OPTION_ID = opt.OPTION_ID   
         group by SCREEN_FROM,hdr.PRTY_FEEDBACK_HDR_ID) as t
         where SCREEN_FROM= '${req.params.pagename}'
         group by t.TotalRating`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("/allpages/ratings", async (req, res) => {
  //getrating

  // let response = await db.query(`call getrating`);

  let response = await db.query(
    `select t.SCREEN_FROM,t.TotalRating,count(*) count from (
      select SCREEN_FROM,hdr.PRTY_FEEDBACK_HDR_ID , sum(opt.Rating),
      case when sum(opt.Rating)>7 then "Positive"  when sum(opt.Rating)>3 and sum(opt.Rating)<=7 then "Neutral" else "Negative" end TotalRating
        from PARTY_FEEDBACK_HDR hdr
        inner join PARTY_FEEDBACK_DTL dtl
        on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
        inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
        on dtl.OPTION_ID = opt.OPTION_ID   
         group by SCREEN_FROM,hdr.PRTY_FEEDBACK_HDR_ID) as t  
         inner join (select SCREEN_FROM from PARTY_FEEDBACK_HDR hdr  
 			group by SCREEN_FROM
 				order by count(*) desc limit 3)  top
		on top.SCREEN_FROM = t.SCREEN_FROM         
         group by t.SCREEN_FROM,t.TotalRating`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("/allpages/ratings/datewise", async (req, res) => {
  let response = await db.query(
    `select date(t.DATE_CREATED) DATE_CREATED,t.TotalRating,count(*) count from (
      select   hdr.DATE_CREATED ,
        case when sum(opt.Rating)>7 then "Positive"  when sum(opt.Rating)>3 and sum(opt.Rating)<=7 then "Neutral" else "Negative" end TotalRating
      from PARTY_FEEDBACK_HDR hdr
      inner join PARTY_FEEDBACK_DTL dtl
      on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
      inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
      on dtl.OPTION_ID = opt.OPTION_ID 
      group by hdr.PRTY_FEEDBACK_HDR_ID,hdr.DATE_CREATED  ) t
    group by t.DATE_CREATED,t.TotalRating`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("/getlatestcomments", async (req, res) => {
  let response = await db.query(
    `select SCREEN_FROM,hdr.PRTY_FEEDBACK_HDR_ID , dtl.OPTION_ANS comment ,hdr.DATE_CREATED,
    hdr.CREATED_BY userId
    from PARTY_FEEDBACK_HDR hdr
    inner join PARTY_FEEDBACK_DTL dtl
    on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
    inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
    on dtl.OPTION_ID = opt.OPTION_ID   
    where opt.OPTION_TYPE='textarea'
    order by hdr.DATE_CREATED desc 
    limit 3`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("/allpages/ratings/quarterwise", async (req, res) => {
  let response = await db.query(
    `select concat("Q-",t.quarter) quarter,t.TotalRating,count(*) count from (
      select   quarter(hdr.DATE_CREATED) quarter,
        case when sum(opt.Rating)>7 then "Positive"  when sum(opt.Rating)>3 and sum(opt.Rating)<=7 then "Neutral" else "Negative" end TotalRating
      from PARTY_FEEDBACK_HDR hdr
      inner join PARTY_FEEDBACK_DTL dtl
      on hdr.PRTY_FEEDBACK_HDR_ID = dtl.PRTY_FEEDBACK_HDR_ID
      inner join PARTY_FEEDBACK_QUESTION_OPTIONS opt
      on dtl.OPTION_ID = opt.OPTION_ID 
      group by hdr.PRTY_FEEDBACK_HDR_ID,quarter(hdr.DATE_CREATED) ) t
    group by t.quarter,t.TotalRating`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(response);
  res.send(response);
});

app.get("*", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(port, () => {
  db.sync();
  console.log(`Example app listening at http://localhost:${port}`);
});
