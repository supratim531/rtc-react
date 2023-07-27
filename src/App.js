import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import Call from './Call';
import Call2 from './Call2';
import Call3 from './Call3';

function App() {
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // const socket = io.connect('http://localhost:8888');
  const socket = io.connect('https://rtc-node.onrender.com/');

  const sendMessage = () => {
    socket.emit('send', {
      room: roomId,
      data: message
    });
  }

  const joinRoom = () => {
    if (roomId !== '') {
      socket.emit('join', {
        room: roomId
      });
      alert(`You have just joined room ${roomId}`);
    } else {
      alert('Please enter a room id');
    }
  }

  useEffect(() => {
    socket.on('receive', data => {
      setMessages(e => [...e, data.data]);
    });

    socket.on('receiving', data => {
      // code here...
    });
  }, [socket]);

  return (
    <div className="App">
      <input onChange={e => setRoomId(e.target.value)} type="text" placeholder='Enter Room ID' />
      <button onClick={joinRoom}>Join</button>
      <br />
      <input onChange={e => setMessage(e.target.value)} type="text" placeholder='Write a message' />
      <button onClick={sendMessage}>Message</button>
      <h1>Messages</h1>
      {
        messages.map((data, index) =>
          <div key={index + 1} className="">
            <span>{data}</span>
          </div>
        )
      }
      {/* <Call /> */}
      {/* <Call2 /> */}
      <Call3 />
    </div>
  );
}

export default App;
