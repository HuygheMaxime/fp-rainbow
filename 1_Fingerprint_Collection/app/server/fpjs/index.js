const express = require("express");
const socket = require("socket.io");
var fileSystem = require('fs');

const PORT = 5000;
const app = express();

const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

app.use(express.static("public"));

const io = socket(server);

const activeUsers = new Set();

io.on("connection", function (socket) {
  socket.on("ecrireDansFichier", function(data) {
    console.log(data.id)
    fileSystem.writeFileSync("./data/"+data.id+'.json', JSON.stringify(data.result), 'utf-8');
  });
});
