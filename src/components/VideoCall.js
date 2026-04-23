import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../socket';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import '../style/VideoCall.css';

function VideoCall() {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const token = localStorage.getItem('token');

  const API = process.env.REACT_APP_API_URL;

  // Fetch available experts
  useEffect(() => {
    axios.get(`${API}/call/experts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setExperts(res.data))
    .catch(err => console.error(err));
  }, [token]);

  // Check camera devices on mount
  const checkCameraDevices = async () => {
    try {
      // First check if mediaDevices API exists
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        toast.error('तुमचा ब्राउझर कॅमेरा सपोर्ट करत नाही. Chrome/Edge वापरा.');
        return false;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        toast.error('कोणताही कॅमेरा सापडला नाही. कृपया कॅमेरा कनेक्ट करा किंवा ब्राउझर सेटिंग तपासा.');
        setCameraAvailable(false);
        return false;
      }
      // Try to get actual stream to confirm permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // stop immediately
      setCameraAvailable(true);
      toast.success('कॅमेरा उपलब्ध आहे!');
      return true;
    } catch (err) {
      console.error('Camera check error:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('कॅमेरा वापरण्याची परवानगी नाकारली. कृपया ब्राउझर सेटिंगमध्ये परवानगी द्या.');
      } else if (err.name === 'NotFoundError') {
        toast.error('कॅमेरा सापडला नाही. डिव्हाइस कनेक्ट असल्याची खात्री करा.');
      } else {
        toast.error('कॅमेरा तपासताना त्रुटी: ' + err.message);
      }
      setCameraAvailable(false);
      return false;
    }
  };

  // Manual check button
  const handleCheckCamera = () => {
    checkCameraDevices();
  };

  // Auto-check on mount
  useEffect(() => {
    checkCameraDevices();
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);
    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      newPeer.destroy();
    };
  }, []);

  // Socket listeners for call signaling
  useEffect(() => {
    if (!peer) return;

    socket.on('incoming_call', async (data) => {
      if (!cameraAvailable) {
        toast.error('कॅमेरा उपलब्ध नाही. कॉल स्वीकारू शकत नाही.');
        socket.emit('reject_call', { caller_sid: data.caller_sid });
        return;
      }
      if (window.confirm(`${data.caller_name} कडून कॉल येत आहे. स्वीकारायचा?`)) {
        setCallStatus('inCall');
        setSelectedExpert({ id: data.caller_id, full_name: data.caller_name });
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          const call = peer.call(data.caller_id, stream);
          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
          call.on('close', () => endCall());
          socket.emit('accept_call', { caller_sid: data.caller_sid });
        } catch (err) {
          handleCameraError(err);
          socket.emit('reject_call', { caller_sid: data.caller_sid });
        }
      } else {
        socket.emit('reject_call', { caller_sid: data.caller_sid });
      }
    });

    return () => {
      socket.off('incoming_call');
    };
  }, [peer, cameraAvailable]);

  const handleCameraError = (err) => {
    console.error('Camera error:', err);
    if (err.name === 'NotFoundError') {
      toast.error('कॅमेरा सापडला नाही. कृपया कॅमेरा कनेक्ट करा.');
    } else if (err.name === 'NotAllowedError') {
      toast.error('परवानगी नाकारली. ब्राउझर सेटिंगमध्ये कॅमेरा सक्षम करा.');
    } else {
      toast.error('कॅमेरा त्रुटी: ' + err.message);
    }
    setCallStatus('idle');
  };

  const startCall = async (expert) => {
    if (!cameraAvailable) {
      toast.error('कॅमेरा उपलब्ध नाही. कृपया प्रथम कॅमेरा तपासा.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setSelectedExpert(expert);
      setCallStatus('calling');
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const call = peer.call(expert.id, stream);
      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setCallStatus('inCall');
      });
      call.on('close', () => endCall());
      socket.emit('call_user', {
        target_user_id: expert.id,
        caller_id: peer.id,
        caller_name: "शेतकरी"
      });
    } catch (err) {
      handleCameraError(err);
    }
  };

  const endCall = () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('ended');
    setSelectedExpert(null);
  };

  return (
    <div className="video-call-container">
      <h2>🎥 कृषी तज्ञाशी व्हिडिओ कॉल</h2>
      <button onClick={handleCheckCamera} className="check-cam-btn">📷 कॅमेरा तपासा</button>
      {!cameraAvailable && (
        <div className="camera-warning">
          ⚠️ कॅमेरा उपलब्ध नाही. कृपया कॅमेरा कनेक्ट करा आणि ब्राउझरला परवानगी द्या.
        </div>
      )}
      {callStatus === 'idle' && (
        <div className="expert-list">
          <h3>उपलब्ध तज्ञ:</h3>
          {experts.length === 0 ? (
            <p>सध्या कोणीही तज्ञ उपलब्ध नाही.</p>
          ) : (
            experts.map(exp => (
              <div key={exp.id} className="expert-card" onClick={() => startCall(exp)}>
                {exp.profile_picture ? (
                  <img src={`${API}${exp.profile_picture}`} alt={exp.full_name} />
                ) : (
                  <div className="default-avatar">👤</div>
                )}
                <span>{exp.full_name}</span>
                <small>({exp.role === 'buyer' ? 'प्रशासक' : 'तज्ञ'})</small>
              </div>
            ))
          )}
        </div>
      )}
      {(callStatus === 'calling' || callStatus === 'inCall') && (
        <div className="call-window">
          <div className="local-video">
            <video ref={localVideoRef} autoPlay muted playsInline />
          </div>
          <div className="remote-video">
            <video ref={remoteVideoRef} autoPlay playsInline />
          </div>
          <button onClick={endCall} className="end-call-btn">कॉल संपवा</button>
        </div>
      )}
    </div>
  );
}

export default VideoCall;