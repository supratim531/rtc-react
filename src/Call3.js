import io from 'socket.io-client';
import React, { useEffect, useMemo, useState } from 'react';

// const socket = io.connect('http://localhost:8888');
const socket = io.connect('https://rtc-node.onrender.com/');
// const socket = io('https://c2df-49-37-9-76.ngrok-free.app', {
//   autoConnect: true,
//   reconnection: true,
//   extraHeaders: {
//     "ngrok-skip-browser-warning": "69420",
//   }
// });

function Call3() {
  const rrr = [];
  const [audioDriver, setAudioDriver] = useState(null);
  const [isFirstBuffer, setIsFirstBuffer] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useMemo(() => {
    setAudioDriver(document.createElement("audio"));
  }, []);

  function startRecord() {
    if (isFirstBuffer) {
      console.log('100');
      mediaRecorder.start(100);
    } else {
      console.log('250');
      mediaRecorder.start(250);
    }
    console.log('MediaRecorder state implies:', mediaRecorder.state);
  }

  function startRecord2() {
    console.log('200');
    mediaRecorder.start(200);
    console.log('MediaRecorder state implies:', mediaRecorder.state);
  }

  function stopRecord() {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    mediaRecorder.onstop = (e) => { console.log("recorder stopped"); startRecord2(); };
  }

  useEffect(() => {
    if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
      console.log("User Media Supported");
      window.navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMediaRecorder(new MediaRecorder(stream));
        })
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }, []);

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

  function getSilentAudioBuffer(time) {
    const FREQ = 44100;
    const duration = time * FREQ;
    const AudioContext = window.AudioContext;
    if (!AudioContext) {
      console.log("No Audio Context");
    }
    const context = new AudioContext();
    const audioBuffer = context.createBuffer(1, duration, FREQ);

    let numOfChan = audioBuffer.numberOfChannels,
      length = duration * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;

    // write WAVE header
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    // write interleaved data
    for (i = 0; i < audioBuffer.numberOfChannels; i++) channels.push(audioBuffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    // create Blob
    return buffer;
    // return new Blob([buffer], { type: "audio/webm;codecs=opus" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  useEffect(() => {
    socket.on('receive', data => {
      let blob = data.sound;

      if (rrr.length === 0) {
        rrr[0] = blob;
      } else {
        rrr[1] = blob;
      }

      console.log(rrr);

      let url = window.URL.createObjectURL(new Blob(rrr, { type: 'audio/webm;codecs=opus' }));
      let audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      audio.play().then(() => {
        console.log('then():', audio);
        console.log(document.getElementsByTagName('audio'));
      }).catch(err => {
        console.log('Error is:', err);
      });
    });
  }, [socket]);

  return (
    <div>
      <h1>Contact with <a href="https://github.com/supratim531" style={{ textDecoration: "none" }} target="_blank">Supratim</a> to properly use this basic prototype</h1>
      <button style={{ fontSize: "2.25rem", lineHeight: "2.25rem" }} onClick={startRecord}>Start</button>
      <span style={{ color: "red" }}>NOTE:</span><span> If any problem occurs use reload</span>
    </div>
  );
}

export default Call3;
