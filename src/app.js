const express = require('express');
require('express-async-errors');
const { resolve } = require('path');
const cors = require('cors');

// const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config({ path: resolve('env', '.env') });

const errorHandling = require('./utils/errors/error-handler');

// const moduleRouter = require('./api/components/modules/router');
const authRouter = require('./api/components/auth/router');

const { default: helmet } = require('helmet');
const { NotFoundError } = require('#errors');

const app = express();
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

app.use(express.json());
app.use(helmet());
app.get('/', (req, res) => {
  res.send('ok');
});

app.use('/api/auth', authRouter);

// this should be at the end of every route handlers
// to catch the error and return
/** @type {import("express").RequestHandler} */
app.use('*', (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandling);

module.exports = app;
