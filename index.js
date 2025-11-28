const config = require("config");
const http = require("http");
const app = require("./server/server");
const socketio = require('socket.io');
const { addUser } = require("./server/controllers/studnt_data_websocket");
const { addSchool } = require('./server/controllers/school_data_websocket');
const { addDistmaster } = require('./server/controllers/distmaster_data_websocket');
const debug = require("debug")("gseb-ht-gen-backend:index"); 

const appPort = config.get("App.config.port");

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("WebSocket client connected");

  socket.on("students", async (message) => {
    const data = JSON.parse(message.records);
    await addUser(data, socket);
  });

  socket.on("schools", async (message) => {
    const data = JSON.parse(message.records);
    await addSchool(data, socket);
  });

  socket.on("districts", async (message) => {
    const data = JSON.parse(message.records);
    await addDistmaster(data, socket);
  });

  socket.on("error", (err) => {
    console.log("socket error", err);
  });

  socket.on("disconnect", () => {
    console.log("WebSocket client disconnected");
  });
});

server.listen(appPort, () => {
  console.log(process.env.NODE_ENV);
  console.log(appPort);
  debug(`server started on port ${config.port} (${process.env.NODE_ENV})`);
});
