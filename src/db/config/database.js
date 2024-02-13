// const { resolve } = require('path');
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      },
      bigNumberStrings: true
    },
    logging: false
  }
  // test: {
  //   username: process.env.CI_DB_USERNAME,
  //   password: process.env.CI_DB_PASSWORD,
  //   database: process.env.CI_DB_NAME,
  //   host: process.env.CI_DB_HOST,
  //   port: process.env.CI_DB_PORT,
  //   dialect: 'postgres',
  //   dialectOptions: {
  //     bigNumberStrings: true
  //   },
  //   logging: false
  // },
  // production: {
  //   username: process.env.PROD_DB_USERNAME,
  //   password: process.env.PROD_DB_PASSWORD,
  //   database: process.env.PROD_DB_NAME,
  //   host: process.env.PROD_DB_HOST,
  //   port: process.env.PROD_DB_PORT,
  //   dialect: 'postgres',
  //   dialectOptions: {
  //     bigNumberStrings: true,
  //     ssl: true,
  //     native: true
  //     // ssl: {
  //     //   ca: fs.readFileSync(__dirname + '/postgres-ca-main.crt')
  //     // }
  //   },
  //   logging: false
  // }
};
