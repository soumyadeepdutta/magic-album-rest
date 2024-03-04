const express = require('express');
require('express-async-errors');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();

const errorHandling = require('./utils/errors/error-handler');

const albumRouter = require('./api/components/album/router');
const authRouter = require('./api/components/auth/router');

const { default: helmet } = require('helmet');
const { NotFoundError } = require('#errors');

const app = express();
app.use(cors({ origin: '*', credentials: true }));

// app.use(express.static('public'));
app.use(express.json());
app.use(helmet());
app.use(fileUpload({ limits: 100 * 1024 * 1024 }));
app.get('/api', (req, res) => {
  res.send('ok');
});

app.use('/api/auth', authRouter);
app.use('/api/album', albumRouter);

// this should be at the end of every route handlers
// to catch the error and return
/** @type {import("express").RequestHandler} */
app.use('*', (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandling);

module.exports = app;
