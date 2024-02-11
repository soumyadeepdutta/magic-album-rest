const { createServer } = require('http');
const app = require('./app');

const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(
    'info:',
    `server started on ${PORT} in ${process.env.NODE_ENV} mode.`
  );
});
