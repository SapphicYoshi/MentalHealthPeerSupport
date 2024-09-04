// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Form data collection logic
    try {
      await axios.post('http://localhost:5000/register', { name, email, password });
      alert('Registered successfully');
    } catch (err) {
      alert('Error registering');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Form data collection logic
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      setUser(response.data.token);
    } catch (err) {
      alert('Error logging in');
    }
  };

  const sendMessage = () => {
    socket.emit('message', { user, text: message });
    setMessage('');
  };

  socket.on('message', (data) => {
    setChat((prev) => [...prev, data]);
  });

  return (
    <div>
      {!user ? (
        <div>
          <h2>Login / Register</h2>
          {/* Forms for registration and login */}
        </div>
      ) : (
        <div>
          <h2>Chat Room</h2>
          <div>
            {chat.map((msg, index) => (
              <p key={index}>{msg.user}: {msg.text}</p>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
