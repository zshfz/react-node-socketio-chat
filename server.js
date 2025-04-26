import { Server } from "socket.io";
import express from "express";
import * as http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let connectedUsers = [];

io.on("connection", (client) => {
  const connectedClientUsername = client.handshake.query.username;
  console.log(`사용자 들어옴 ${connectedClientUsername}`);

  // ✅ 사용자 목록에 추가
  connectedUsers.push(connectedClientUsername);
  console.log("현재 접속자:", connectedUsers);

  // ✅ 사용자 목록 전송
  io.emit("update users", connectedUsers);

  // 접속 알림
  client.broadcast.emit("new message", {
    username: "관리자",
    message: `${connectedClientUsername}님이 방에 들어왔습니다`,
  });

  // 메세지 수신 처리
  client.on("new message", (msg) => {
    io.emit("new message", {
      username: msg.username,
      message: msg.message,
    });
  });

  // 접속 해제 처리
  client.on("disconnect", () => {
    console.log(`사용자 나감 ${connectedClientUsername}`);

    connectedUsers = connectedUsers.filter(
      (user) => user !== connectedClientUsername
    );
    console.log("남은 접속자 목록:", connectedUsers);

    io.emit("update users", connectedUsers);

    io.emit("new message", {
      username: "관리자",
      message: `${connectedClientUsername}님이 방에 나갔습니다`,
    });
  });
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버에서 듣고 있습니다 ${PORT}`);
});
