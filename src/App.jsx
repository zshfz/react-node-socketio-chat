import { useEffect, useState, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentUsers, setCurrentUsers] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function connectToChatServer() {
    const _socket = io("https://react-node-socketio-chat.onrender.com", {
      autoConnect: false,
      query: { username: username },
    });
    _socket.connect();
    setSocket(_socket);
  }

  function disconnectToChatServer() {
    socket?.disconnect();
  }

  function onConnected() {
    setIsConnected(true);
  }

  function onDisConnected() {
    setIsConnected(false);
    setCurrentUsers([]); // ✅ 접속 종료 시 목록 초기화
  }

  function onMessageReceived(msg) {
    setMessages((previous) => [...previous, msg]);
  }

  function onUpdateUsers(users) {
    console.log("접속자 목록 업데이트:", users);
    setCurrentUsers(users);
  }

  function sendMessageToChatServer() {
    if (userInput.trim() === "") return;
    socket?.emit("new message", { username: username, message: userInput });
  }

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", onConnected);
    socket.on("disconnect", onDisConnected);
    socket.on("new message", onMessageReceived);
    socket.on("update users", onUpdateUsers);

    return () => {
      socket.off("connect", onConnected);
      socket.off("disconnect", onDisConnected);
      socket.off("new message", onMessageReceived);
      socket.off("update users", onUpdateUsers);
    };
  }, [socket]);

  return (
    <>
      <div className="navbar">
        <h2>React + Nodejs + SocketIO 기반 채팅 프로그램</h2>
        <h3>
          <div> 닉네임: {username}</div>
          <div> 상태: {isConnected ? "접속중" : "미접속"}</div>
        </h3>
        <div className="username-input">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="닉네임 입력"
          />
          <button onClick={connectToChatServer}>접속</button>
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
        {messages.map((msg, i) => (
          <li
            key={i}
            style={{ fontWeight: msg.username === username ? "bold" : "" }}
          >
            {msg.username} : {msg.message}
          </li>
        ))}
        <div ref={chatEndRef}></div>
      </ul>

      <div className="current-user">
        <h4 className="current-user-title">현재 접속자 목록</h4>
        <ul className="current-user-list">
          {currentUsers.map((user, i) => (
            <li key={i}>{user}</li>
          ))}
        </ul>
      </div>

      <div className="message-input">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="메세지를 입력하세요"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessageToChatServer();
              setUserInput("");
            }
          }}
        />
        <button
          onClick={() => {
            sendMessageToChatServer();
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
