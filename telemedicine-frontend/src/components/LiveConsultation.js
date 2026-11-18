// LiveConsultation.js (Doctor Side)

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Peer from 'simple-peer';
import axios from 'axios';
import './LiveConsultation.css';

function LiveConsultation() {
  const { consultationId } = useParams();
  const [connected, setConnected] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [doctorName, setDoctorName] = useState('Doctor');

  const stompClientRef = useRef(null);
  const peerRef = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem('user'));
    if (doctor?.name) setDoctorName(doctor.name);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/signal/${consultationId}`, onSignalReceive);
        client.subscribe(`/topic/chat/${consultationId}`, onChatReceive);
        stompClientRef.current = client;
        setConnected(true);
      },
      onStompError: (frame) => console.error('STOMP error:', frame),
    });

    client.activate();

    axios.get(`http://localhost:8080/api/chat/${consultationId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("❌ Chat load failed", err));

    return () => {
      client.deactivate();
      stopTimer();
    };
  }, [consultationId]);

  const onSignalReceive = (msg) => {
    const data = JSON.parse(msg.body);
    if (data.type === 'answer' || data.type === 'candidate') {
      peerRef.current?.signal(data.signal);
    }
  };

  const onChatReceive = (msg) => {
    const chat = JSON.parse(msg.body);
    setMessages(prev => [...prev, chat]);
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    const peer = new Peer({ initiator: true, trickle: false, stream });
    peerRef.current = peer;

    peer.on('signal', signal => {
      stompClientRef.current.publish({
        destination: `/app/signal/${consultationId}`,
        body: JSON.stringify({
          type: signal.type === 'offer' ? 'offer' : 'candidate',
          signal
        })
      });
    });

    peer.on('stream', remote => {
      remoteVideo.current.srcObject = remote;
    });

    peer.on('close', () => {
      alert('Patient disconnected');
      endCall();
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
    });

    setCallStarted(true);
    startTimer();
  };

  const endCall = () => {
    peerRef.current?.destroy();
    setCallStarted(false);
    stopTimer();

    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getTracks().forEach(track => track.stop());
      localVideo.current.srcObject = null;
    }

    remoteVideo.current.srcObject = null;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const chat = {
      sender: doctorName,
      content: messageInput.trim(),
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.publish({
      destination: `/app/chat/${consultationId}`,
      body: JSON.stringify(chat)
    });

    setMessages(prev => [...prev, chat]);
    setMessageInput('');
  };

  return (
    <div className="live-container">
      <h2>👨‍⚕️ {doctorName} - Live Consultation</h2>

      <div className="video-box">
        <video ref={localVideo} autoPlay muted />
        <video ref={remoteVideo} autoPlay />
        {callStarted && (
          <div className="timer">
            ⏱ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {!callStarted ? (
        <button onClick={startCall} disabled={!connected}>
          Start Call
        </button>
      ) : (
        <button onClick={endCall} className="end-call-btn">
          End Call
        </button>
      )}

      <div className="chat-box">
        <h4>💬 Chat</h4>
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i}>
              <strong>{m.sender}</strong>: {m.content}
              <span className="timestamp">{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <div className="input-row">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default LiveConsultation;
