import io from 'socket.io-client';
import React, { useEffect } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

const socket = io.connect('http://localhost:8888');

function Call2() {
  const recorderControls = useAudioRecorder();

  useEffect(() => {
    if (recorderControls !== undefined) {
      if (recorderControls.isRecording) {
        console.log("Recording...");
        const myBlob = recorderControls.mediaRecorder?.stream;
        const blob = new Blob([myBlob], { type: 'audio/webm;codecs=opus' });
        socket.emit('call', {
          sound: blob
        });
      }
    }
  });

  return (
    <div>
      <div className="">
        <AudioRecorder
          recorderControls={recorderControls}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true
          }}
        />
      </div>
    </div>
  );
}

export default Call2;
