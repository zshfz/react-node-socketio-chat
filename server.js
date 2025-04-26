import { Server } from "socket.io";
import express from "express";
import * as http from "http";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express 앱 설정
const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: "*", // 배포할 도메인으로 설정해도 됨
  },
});

// 소켓 연결
io.on("connection", (client) => {
  const connectedClientUsername = client.handshake.query.username;
  console.log(`사용자 들어옴 ${connectedClientUsername}`);

  client.broadcast.emit("new message", {
    username: "관리자",
    message: `${connectedClientUsername}님이 방에 들어왔습니다`,
  });

  client.on("new message", (msg) => {
    console.log(`보낸 사용자 ${connectedClientUsername}`);
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

// 정적 파일 서빙 (Vite 빌드 결과)
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// Render 환경에서는 이 포트 필수!
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버에서 듣고 있습니다 ${PORT}`);
});
