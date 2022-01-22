const Sequelize = require("sequelize");

module.exports = new Sequelize("feedback", "root", "root123", {
  host: "localhost",
  port: "3307",
  dialect: "mysql",
  // dialectOptions: {
  //   connectTimeout: 60000
  // },
  logging: true,
  //insecureAuth:true,  //allow connectikon to http
  pool: {
    max: 25,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

//SQL Server

// sequelize = new Sequelize("VUIS_DEMO_DB", "vuis_conv_ben", "vuis_conv_ben", {
//     dialect: 'mssql',
//     host: "localhost",
//     port: 1433,
//     dialectOptions: {
//         instanceName: '10.0.0.11',
//         requestTimeout: 30000,
//         encrypt: true
//     }
// });

// module.exports = new Sequelize("feedback", "sa", "sa123", {
//   dialect: "mssql",
//   host: "localhost",
//   port: 1433,
//   dialectOptions: {
//     // instanceName: "ROCKET/SQLEXPRESS",
//     requestTimeout: 30000,
//     encrypt: true,
//   },
// });
