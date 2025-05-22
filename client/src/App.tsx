import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

interface Message {
  id: number;
  text: string;
  user: string;
  timestamp: string;
}

interface User {
  id: string;
  username: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('message:receive', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('users:update', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('user:join', username);
      setIsLoggedIn(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('message:send', message);
      setMessage('');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Войти в чат</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите ваше имя"
            required
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="users-list">
        <h3>Онлайн ({users.length})</h3>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        <div className="messages">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`message ${msg.user === username ? 'own' : ''}`}
            >
              <div className="message-header">
                <span className="username">{msg.user}</span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
          />
          <button type="submit">Отправить</button>
        </form>
      </div>
    </div>
  );
}

export default App; 