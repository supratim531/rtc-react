import io from 'socket.io-client';
import React, { useEffect, useMemo, useState } from 'react';

const socket = io.connect('http://localhost:8888');
// const socket = io.connect('https://rtc-node.onrender.com/');
// const socket = io.connect('https://dd01-49-37-8-24.ngrok-free.app/');

function Call3() {
  const rrr = [];
  const [sound, setSound] = useState(null);
  const [started, setStarted] = useState(true);
  const [binaryData, setBinaryData] = useState([]);
  const [audioDriver, setAudioDriver] = useState(null);
  const [silentBuffer, setSilentBuffer] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useMemo(() => {
    setAudioDriver(document.createElement("audio"));
  }, []);

  function startRecord() {
    mediaRecorder.start(500);
    console.log('MediaRecorder state implies:', mediaRecorder.state);
  }

  function stopRecord() {
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

  // useEffect(() => {
  //   setSilentBuffer(getSilentAudioBuffer(1));
  // }, [])

  useEffect(() => {
    socket.on('receive', data => {
      let blob = data.sound;

      // if (rrr.length >= 2) {
      //   rrr[1] = blob;
      // } else {
      //   rrr.push(blob);
      // }

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
      // audio.play().then(() => {
      //   console.log('then():', audio.currentSrc);
      //   console.log('then():', audio.currentTime);
      // }).catch(err => {
      //   console.log('Error:', err);
      //   console.log('catch():', audio.currentSrc);
      //   console.log('catch():', audio.currentTime);
      // });

      // setSound(sound);
      // let tempData = [blob];
      // setBinaryData(tempData);
      // setBinaryData(binary => [...binary, blob]);
      // let url = window.URL.createObjectURL(new Blob([blob], { type: 'audio/mp3;codecs=opus' }));
      // audioDriver.src = url;
      // audioDriver.controls = true;
      // audioDriver.load();
      // audioDriver.play()
      //   .then(() => {
      //     // Audio is playing.
      //   })
      //   .catch(error => {
      //     console.log(error);
      //   });
    });
  }, [socket]);

  const test = async () => {
    // await audio.play();

    try {
      let url = window.URL.createObjectURL(new Blob([binaryData[0]], { type: 'audio/mp3;codecs=opus' }));
      console.log('after url:', url);
      // audioDriver.src = url;
      // audioDriver.crossOrigin = "anonymous";
      console.log('after:', binaryData);
      console.log('after:', binaryData.slice(-1));
      // audioDriver.controls = true;
      // await audioDriver.play();
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    console.log("useEffect e asche...");
    // console.log(binaryData);

    if (0) {
      // if (binaryData.length && started) {
      console.log(binaryData.length);
      console.log(binaryData);
      // setStarted(false);

      let url = window.URL.createObjectURL(new Blob(binaryData, { type: 'audio/webm;codecs=opus' }));
      // let audio = document.createElement("audio");
      let audio = new
        audio.play().then(() => {
          console.log('Music played');
        }).catch(err => {
          console.log('Error is:', err);
          // url = window.URL.createObjectURL(new Blob(binaryData, { type: 'audio/webm;codecs=opus' }));
          // audio.src = url;
          // audio.controls = true;
          console.log("End in catch");

          // let url = window.URL.createObjectURL(new Blob(binaryData, { type: 'audio/webm;codecs=opus' }));
          // let audio = document.createElement("audio");
          // audio.src = url;
          // audio.controls = true;
        });

      // let arr = binaryData[binaryData.length - 1];
      // console.log('before:', binaryData);
      // console.log('before:', binaryData.slice(-1));
      // let url = window.URL.createObjectURL(new Blob(binaryData.slice(-1), { type: 'audio/webm;codecs=opus' }));
      // audio.crossOrigin = "anonymous";
      // // audio.play();
      // console.log('after url:', url);
      // console.log('after:', binaryData);
      // console.log('after:', binaryData.slice(-1));
      // let audio = document.createElement("audio");
      // audio.paused
      // audio.src = binaryData.at(binaryData.length - 1);
      // audio.controls = true;
      // audio.play();
      // test(audioDriver);
      // audioDriver.play().then().catch(err => console.log(err));
      // test();
    }
  }, [binaryData]);

  return (
    <div>
      <button onClick={startRecord}>Start</button>
    </div>
  );
}

export default Call3;
