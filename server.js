import { Server } from "socket.io";
import express from "express";
import * as http from "http";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (client) => {
  console.log(client.handshake.query);

  const connectedClientUsername = client.handshake.query.username;
  console.log(`사용자 들어옴 ${connectedClientUsername}`);

  client.broadcast.emit("new message", {
    username: "관리자",
    message: `${connectedClientUsername}님이 방에 들어왔습니다`,
  });

  client.on("new message", (msg) => {
    console.log(`보낸 사용자 ${connectedClientUsername}`);
    console.log(msg);
    io.emit("new message", {
      username: msg.username,
      message: msg.message,
    });
  });

  client.on("disconnect", () => {
    console.log(`사용자 나감 ${connectedClientUsername}`);
    io.emit("new message", {
      username: "관리자",
      message: `${connectedClientUsername}님이 방에 나갔습니다`,
    });
  });
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "dist")));

app.get("/*", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
// 🔥 포트 수정
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버에서 듣고 있습니다 ${PORT}`);
});
