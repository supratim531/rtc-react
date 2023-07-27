import io from 'socket.io-client';
import React, { useEffect, useMemo, useState } from 'react';

// const socket = io.connect('http://localhost:8888');
const socket = io.connect('https://rtc-node.onrender.com/');

function Call3() {
  const rrr = [];
  const [sound, setSound] = useState(null);
  const [started, setStarted] = useState(true);
  const [binaryData, setBinaryData] = useState([]);
  const [audioDriver, setAudioDriver] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useMemo(() => {
    setAudioDriver(document.createElement("audio"));
  }, []);

  function startRecord() {
    mediaRecorder.start(1000);
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

  useEffect(() => {
    socket.on('receive', data => {
      let blob = data.sound;
      if (rrr.length >= 2) {
        rrr[1] = blob;
      } else {
        rrr.push(blob);
      }
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
