import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

function Call() {
  const socket = io.connect('http://localhost:8888');

  const [id, setId] = useState('');
  const [me, setMe] = useState('');
  const [name, setName] = useState('');
  const [stream, setStream] = useState('');
  const [caller, setCaller] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [callerSignal, setCallerSignal] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const callUser = id => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', data => {
      console.log('Initializing call...', data);
      socket.emit('callUser', {
        to: id,
        from: me,
        name: name,
        signal: data
      });
    });

    peer.on('stream', stream => {
      console.log('peer.stream in callUser', stream);
      // userVideo.current.srcObject = stream;
    });

    socket.on('callAccepted', signal => {
      console.log('Call accepted:', signal);
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  }

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', data => {
      console.log('peer.signal in answerCall', data);
      socket.emit('answerCall', {
        to: caller,
        signal: data
      });
    });

    peer.on('stream', stream => {
      console.log('peer.stream in answerCall', stream);
      // userVideo.current.srcObject = stream
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  }

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setStream(stream);
        console.log(stream);
        try {
          // myVideo.current.srcObject = stream;
        } catch {
          console.log('Koi baat nahi');
        }
      });

    socket.on('me', id => {
      setMe(id);
    });

    socket.on('callUser', data => {
      console.log('useEffect callUser:', data);

      setName(data.name);
      setCaller(data.from);
      setReceivingCall(true);
      setCallerSignal(data.signal);
    });
  }, []);

  return (
    <div>
      {/* <div className="video-container">
        <div className="video">
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
        </div>
        <div className="video">
          {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} /> :
            null}
        </div>
      </div> */}
      <div className="">
        {me && <h2>{me}</h2>}
      </div>
      {
        (receivingCall && !callAccepted) ?
          <button onClick={answerCall}>{name} is calling...</button> :
          <div className="">
            <input value={name} onChange={e => setName(e.target.value)} type="text" name="" id="" placeholder='Enter Your Name' />
            <br />
            <input value={id} onChange={e => setId(e.target.value)} type="text" name="" id="" placeholder='Enter ID' />
            <br />
            <button onClick={() => callUser(id)}>Call</button>
          </div>
      }
    </div>
  );
}

export default Call;
