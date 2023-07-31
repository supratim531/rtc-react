import io from 'socket.io-client';
import React, { useEffect, useState } from 'react';

// const socket = io.connect('http://localhost:8888');
const socket = io.connect('https://rtcnode.onrender.com/');

function AudioCall() {
  let audioBuffer = [];
  const [isFirstBuffer, setIsFirstBuffer] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  function startRecordForFirstBuffer() {
    console.log('80');
    mediaRecorder.start(80);
    console.log('MediaRecorder state implies:', mediaRecorder.state);
  }

  function startRecord() {
    console.log('200');
    mediaRecorder.start(200);
    console.log('MediaRecorder state implies:', mediaRecorder.state);
  }

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = event => {
        socket.emit('call', { sound: event.data });

        if (isFirstBuffer) {
          setIsFirstBuffer(false);
          stopRecord();
        }
      };
    }
  });

  function stopRecord() {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);

    mediaRecorder.onstop = () => {
      console.log("recorder stopped");
      startRecord();
    };
  }

  useEffect(() => {
    if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
      console.log("User media supported");
      window.navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMediaRecorder(new MediaRecorder(stream));
        })
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log("User media not supported on your browser!");
    }
  }, []);

  useEffect(() => {
    socket.on('receive', data => {
      let sound = data.sound;

      if (audioBuffer.length === 0) {
        audioBuffer[0] = sound;
      } else {
        audioBuffer[1] = sound;
      }

      console.log(audioBuffer);
      let blob = new Blob(audioBuffer, { type: 'audio/webm;codecs=opus' });
      let url = window.URL.createObjectURL(blob);
      let audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      audio.play().then(() => {
        console.log('then():', audio);
      }).catch(err => {
        console.log('catch():', err);
      });
    });
  }, [socket]);

  return (
    <div>
      <h1>Contact with <a href="https://github.com/supratim531" style={{ textDecoration: "none" }} target="_blank">Supratim</a> to properly use this basic prototype</h1>
      <button style={{ fontSize: "2.25rem", lineHeight: "2.25rem" }} onClick={startRecordForFirstBuffer}>Start</button>
      <h4><span style={{ color: "red" }}>NOTE:</span><span> If any problem occurs use reload</span></h4>
    </div>
  );
}

export default AudioCall;
