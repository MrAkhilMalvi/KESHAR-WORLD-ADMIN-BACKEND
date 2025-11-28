const config = require("config");
const http = require("http");
const app = require("./server/server");

const debug = require("debug")("gseb-ht-gen-backend:index"); 

const appPort = config.get("App.config.port");

const server = http.createServer(app);

server.listen(appPort, () => {
  console.log(process.env.NODE_ENV);
  console.log(appPort);
  debug(`server started on port ${config.port} (${process.env.NODE_ENV})`);
});
