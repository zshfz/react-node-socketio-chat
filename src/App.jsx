import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [userInput, setUserInput] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function connectToChatServer() {
    console.log("connectToChatServer");
    const _socket = io("https://react-node-socketio-chat.onrender.com", {
      autoConnect: false,
      query: { username: username },
    });
    _socket.connect();
    setSocket(_socket);
  }

  function disconnectToChatServer() {
    console.log("disconnectToChatServer");
    socket?.disconnect();
  }

  function onConnected() {
    console.log("front onConnected");
    setIsConnected(true);
  }

  function onDisConnected() {
    console.log("front onDisConnected");
    setIsConnected(false);
  }

  function onMessageReceived(msg) {
    console.log("front onMessageReceived");
    console.log(msg);

    setMessages((previous) => [...previous, msg]);
  }

  function sendMessageToChatServer() {
    console.log(`front sendMessageToChatServer input: ${userInput}`);
    socket?.emit(
      "new message",
      { username: username, message: userInput },
      (response) => {
        console.log(response);
      }
    );
  }

  useEffect(() => {
    console.log("useEffect called");
    socket?.on("connect", onConnected);
    socket?.on("disconnect", onDisConnected);

    socket?.on("new message", onMessageReceived);
    return () => {
      console.log("useEffect clean up function called");
      socket?.off("connect", onConnected);
      socket?.off("disconnect", onDisConnected);
      socket?.off("new message", onMessageReceived);
    };
  }, [socket]);

  const messageList = messages.map((a, i) => {
    const isMyMessage = a.username === username; // 내가 보낸 메시지 체크
    return (
      <li key={i} style={{ backgroundColor: isMyMessage ? "gray" : "" }}>
        {a.username} : {a.message}
      </li>
    );
  });

  return (
    <>
      <div className="navbar">
        <h2>React + Nodejs + SocketIO 기반 채팅 프로그램</h2>
        <h3>
          <div> 닉네임: {username}</div>
          <div> 현재 접속 상태: {isConnected ? "접속중" : "미접속"}</div>
        </h3>
        <div className="username-input">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            placeholder="닉네임을 입력하고 접속 버튼을 눌러 채팅에 참여하세요"
          />
          <button
            onClick={() => {
              connectToChatServer();
            }}
          >
            접속
          </button>
          <button
            onClick={() => {
              disconnectToChatServer();
              setUsername("");
            }}
          >
            접속 종료
          </button>
        </div>
      </div>

      <ul className="chat-list">
        {messageList}
        <div ref={chatEndRef}></div>
      </ul>

      <div className="message-input">
        <input
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
          }}
          placeholder="메세지를 입력하세요"
        />
        <button
          onClick={(e) => {
            sendMessageToChatServer(e);
            setUserInput("");
          }}
        >
          보내기
        </button>
      </div>
    </>
  );
}

export default App;
