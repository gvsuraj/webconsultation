import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Peer from 'simple-peer';
import axios from 'axios';
import './LiveConsultation.css';

function PatientLiveConsultation() {
  const { consultationId } = useParams();
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [offerSignal, setOfferSignal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [patientName, setPatientName] = useState('Patient');

  const stompClientRef = useRef(null);
  const peerRef = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const patient = JSON.parse(localStorage.getItem('user'));
    if (patient?.name) setPatientName(patient.name);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 Connected to WebSocket');
        client.subscribe(`/topic/signal/${consultationId}`, onSignalReceive);
        client.subscribe(`/topic/chat/${consultationId}`, onChatReceive);
        stompClientRef.current = client;
        setConnected(true);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    client.activate();

    axios.get(`http://localhost:8080/api/chat/${consultationId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Chat load error', err));

    return () => {
      client.deactivate();
      stopTimer();
    };
  }, [consultationId]);

  const startTimer = () => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  const onSignalReceive = (message) => {
    const data = JSON.parse(message.body);
    if (data.type === 'offer') {
      setOfferSignal(data.signal);
      setIncomingCall(true);
    } else if (data.type === 'candidate') {
      peerRef.current?.signal(data.signal);
    }
  };

  const onChatReceive = (message) => {
    const chat = JSON.parse(message.body);
    setMessages(prev => [...prev, chat]);
  };

  const acceptCall = async () => {
    setAccepted(true);
    setIncomingCall(false);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    const peer = new Peer({ initiator: false, trickle: false, stream });
    peerRef.current = peer;

    peer.on('signal', (signalData) => {
      if (stompClientRef.current) {
        stompClientRef.current.publish({
          destination: `/app/signal/${consultationId}`,
          body: JSON.stringify({
            type: signalData.type === 'answer' ? 'answer' : 'candidate',
            signal: signalData
          })
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      remoteVideo.current.srcObject = remoteStream;
    });

    peer.on('close', () => {
      alert('Doctor disconnected');
      endCall();
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
    });

    peer.signal(offerSignal);
    startTimer();
  };

  const endCall = () => {
    peerRef.current?.destroy();
    setAccepted(false);
    stopTimer();

    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getTracks().forEach(track => track.stop());
      localVideo.current.srcObject = null;
    }

    remoteVideo.current.srcObject = null;
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const chat = {
      sender: patientName,
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
      <h2>🟢 {patientName} - Live Consultation</h2>

      <div className="video-box">
        <video ref={localVideo} autoPlay muted />
        <video ref={remoteVideo} autoPlay />
        {accepted && (
          <div className="timer">
            ⏱ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {incomingCall && !accepted && (
        <div className="incoming">
          <p className="waiting">📞 Incoming call from doctor...</p>
          <button onClick={acceptCall} disabled={!connected}>
            Accept Call
          </button>
        </div>
      )}

      {accepted && (
        <button className="end-call-btn" onClick={endCall}>
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

export default PatientLiveConsultation;
