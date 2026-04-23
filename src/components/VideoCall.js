// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import socket from '../socket';
// import Peer from 'peerjs';
// import toast from 'react-hot-toast';
// import '../style/VideoCall.css';

// function VideoCall() {
//   const [experts, setExperts] = useState([]);
//   const [selectedExpert, setSelectedExpert] = useState(null);
//   const [callStatus, setCallStatus] = useState('idle');
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [peer, setPeer] = useState(null);
//   const [cameraAvailable, setCameraAvailable] = useState(false);
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const token = localStorage.getItem('token');

//   const API = process.env.REACT_APP_API_URL;

//   // Fetch available experts
//   useEffect(() => {
//     axios.get(`${API}/call/experts`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => setExperts(res.data))
//     .catch(err => console.error(err));
//   }, [token]);

//   // Check camera devices on mount
//   const checkCameraDevices = async () => {
//     try {
//       // First check if mediaDevices API exists
//       if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
//         toast.error('तुमचा ब्राउझर कॅमेरा सपोर्ट करत नाही. Chrome/Edge वापरा.');
//         return false;
//       }
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
//       if (videoDevices.length === 0) {
//         toast.error('कोणताही कॅमेरा सापडला नाही. कृपया कॅमेरा कनेक्ट करा किंवा ब्राउझर सेटिंग तपासा.');
//         setCameraAvailable(false);
//         return false;
//       }
//       // Try to get actual stream to confirm permission
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       stream.getTracks().forEach(track => track.stop()); // stop immediately
//       setCameraAvailable(true);
//       toast.success('कॅमेरा उपलब्ध आहे!');
//       return true;
//     } catch (err) {
//       console.error('Camera check error:', err);
//       if (err.name === 'NotAllowedError') {
//         toast.error('कॅमेरा वापरण्याची परवानगी नाकारली. कृपया ब्राउझर सेटिंगमध्ये परवानगी द्या.');
//       } else if (err.name === 'NotFoundError') {
//         toast.error('कॅमेरा सापडला नाही. डिव्हाइस कनेक्ट असल्याची खात्री करा.');
//       } else {
//         toast.error('कॅमेरा तपासताना त्रुटी: ' + err.message);
//       }
//       setCameraAvailable(false);
//       return false;
//     }
//   };

//   // Manual check button
//   const handleCheckCamera = () => {
//     checkCameraDevices();
//   };

//   // Auto-check on mount
//   useEffect(() => {
//     checkCameraDevices();
//   }, []);

//   // Initialize PeerJS
//   useEffect(() => {
//     const newPeer = new Peer();
//     setPeer(newPeer);
//     return () => {
//       if (localStream) localStream.getTracks().forEach(track => track.stop());
//       newPeer.destroy();
//     };
//   }, []);

//   // Socket listeners for call signaling
//   useEffect(() => {
//     if (!peer) return;

//     socket.on('incoming_call', async (data) => {
//       if (!cameraAvailable) {
//         toast.error('कॅमेरा उपलब्ध नाही. कॉल स्वीकारू शकत नाही.');
//         socket.emit('reject_call', { caller_sid: data.caller_sid });
//         return;
//       }
//       if (window.confirm(`${data.caller_name} कडून कॉल येत आहे. स्वीकारायचा?`)) {
//         setCallStatus('inCall');
//         setSelectedExpert({ id: data.caller_id, full_name: data.caller_name });
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//           setLocalStream(stream);
//           if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//           const call = peer.call(data.caller_id, stream);
//           call.on('stream', (remoteStream) => {
//             setRemoteStream(remoteStream);
//             if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//           });
//           call.on('close', () => endCall());
//           socket.emit('accept_call', { caller_sid: data.caller_sid });
//         } catch (err) {
//           handleCameraError(err);
//           socket.emit('reject_call', { caller_sid: data.caller_sid });
//         }
//       } else {
//         socket.emit('reject_call', { caller_sid: data.caller_sid });
//       }
//     });

//     return () => {
//       socket.off('incoming_call');
//     };
//   }, [peer, cameraAvailable]);

//   const handleCameraError = (err) => {
//     console.error('Camera error:', err);
//     if (err.name === 'NotFoundError') {
//       toast.error('कॅमेरा सापडला नाही. कृपया कॅमेरा कनेक्ट करा.');
//     } else if (err.name === 'NotAllowedError') {
//       toast.error('परवानगी नाकारली. ब्राउझर सेटिंगमध्ये कॅमेरा सक्षम करा.');
//     } else {
//       toast.error('कॅमेरा त्रुटी: ' + err.message);
//     }
//     setCallStatus('idle');
//   };

//   const startCall = async (expert) => {
//     if (!cameraAvailable) {
//       toast.error('कॅमेरा उपलब्ध नाही. कृपया प्रथम कॅमेरा तपासा.');
//       return;
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setSelectedExpert(expert);
//       setCallStatus('calling');
//       setLocalStream(stream);
//       if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//       const call = peer.call(expert.id, stream);
//       call.on('stream', (remoteStream) => {
//         setRemoteStream(remoteStream);
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//         setCallStatus('inCall');
//       });
//       call.on('close', () => endCall());
//       socket.emit('call_user', {
//         target_user_id: expert.id,
//         caller_id: peer.id,
//         caller_name: "शेतकरी"
//       });
//     } catch (err) {
//       handleCameraError(err);
//     }
//   };

//   const endCall = () => {
//     if (localStream) localStream.getTracks().forEach(track => track.stop());
//     setLocalStream(null);
//     setRemoteStream(null);
//     setCallStatus('ended');
//     setSelectedExpert(null);
//   };

//   return (
//     <div className="video-call-container">
//       <h2>🎥 कृषी तज्ञाशी व्हिडिओ कॉल</h2>
//       <button onClick={handleCheckCamera} className="check-cam-btn">📷 कॅमेरा तपासा</button>
//       {!cameraAvailable && (
//         <div className="camera-warning">
//           ⚠️ कॅमेरा उपलब्ध नाही. कृपया कॅमेरा कनेक्ट करा आणि ब्राउझरला परवानगी द्या.
//         </div>
//       )}
//       {callStatus === 'idle' && (
//         <div className="expert-list">
//           <h3>उपलब्ध तज्ञ:</h3>
//           {experts.length === 0 ? (
//             <p>सध्या कोणीही तज्ञ उपलब्ध नाही.</p>
//           ) : (
//             experts.map(exp => (
//               <div key={exp.id} className="expert-card" onClick={() => startCall(exp)}>
//                 {exp.profile_picture ? (
//                   <img src={`${API}${exp.profile_picture}`} alt={exp.full_name} />
//                 ) : (
//                   <div className="default-avatar">👤</div>
//                 )}
//                 <span>{exp.full_name}</span>
//                 <small>({exp.role === 'buyer' ? 'खरेदीदार' : 'तज्ञ'})</small>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//       {(callStatus === 'calling' || callStatus === 'inCall') && (
//         <div className="call-window">
//           <div className="local-video">
//             <video ref={localVideoRef} autoPlay muted playsInline />
//           </div>
//           <div className="remote-video">
//             <video ref={remoteVideoRef} autoPlay playsInline />
//           </div>
//           <button onClick={endCall} className="end-call-btn">कॉल संपवा</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default VideoCall;




import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import '../style/VideoCall.css';

// Socket connection (तुमच्या socket.js प्रमाणे URL वापरा)
const socket = io(process.env.REACT_APP_API_URL);

function VideoCall() {
  const [users, setUsers] = useState([]);           // सर्व buyers/farmers
  const [callStatus, setCallStatus] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user')); // { id, name, role }
  const API = process.env.REACT_APP_API_URL;

  // ---------- 1. उपलब्ध buyers/farmers मिळवा ----------
  useEffect(() => {
    if (!token || !currentUser) return;
    axios.get(`${API}/call/experts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('Experts/Buyers API response:', res.data);
      setUsers(res.data);
    })
    .catch(err => {
      console.error('Error fetching experts:', err);
      toast.error('तज्ञांची यादी मिळवताना त्रुटी');
    });
  }, [token, currentUser]);

  // ---------- 2. कॅमेरा उपलब्धता तपासा ----------
  const checkCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        toast.error('तुमचा ब्राउझर कॅमेरा सपोर्ट करत नाही. Chrome/Edge वापरा.');
        setCameraAvailable(false);
        return false;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        toast.error('कोणताही कॅमेरा सापडला नाही.');
        setCameraAvailable(false);
        return false;
      }
      // प्रत्यक्ष परवानगी तपासा
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraAvailable(true);
      toast.success('कॅमेरा उपलब्ध आहे!');
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') toast.error('कॅमेरा परवानगी नाकारली.');
      else if (err.name === 'NotFoundError') toast.error('कॅमेरा सापडला नाही.');
      else toast.error('कॅमेरा त्रुटी: ' + err.message);
      setCameraAvailable(false);
      return false;
    }
  };

  // ---------- 3. PeerJS initialize आणि Socket वर register ----------
  useEffect(() => {
    const newPeer = new Peer();   // PeerJS server ला auto-connect
    newPeer.on('open', (id) => {
      console.log('My PeerJS ID:', id);
      setPeer(newPeer);
      setMyPeerId(id);
      // Socket वर user register करा (Peer ID सह)
      if (currentUser && currentUser.id) {
        socket.emit('register_user', {
          user_id: currentUser.id,
          peer_id: id     // backend ने हे स्टोअर करावे
        });
      }
    });
    newPeer.on('error', (err) => {
      console.error('PeerJS error:', err);
      toast.error('PeerJS कनेक्शन त्रुटी');
    });
    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      newPeer.destroy();
      socket.disconnect();
    };
  }, [currentUser]);

  // ---------- 4. Socket इव्हेंट्स (Incoming Call, Accept, Reject, Offer, Answer, ICE) ----------
  useEffect(() => {
    if (!peer) return;

    // इतरांकडून कॉल येतो
    socket.on('incoming_call', async (data) => {
      if (!cameraAvailable) {
        toast.error('कॅमेरा उपलब्ध नाही. कॉल स्वीकारू शकत नाही.');
        socket.emit('reject_call', { caller_sid: data.caller_sid });
        return;
      }
      const accept = window.confirm(`${data.caller_name} कडून कॉल येत आहे. स्वीकारायचा?`);
      if (!accept) {
        socket.emit('reject_call', { caller_sid: data.caller_sid });
        return;
      }
      setCallStatus('inCall');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Callee (आपण) Caller ला call करतो (caller च्या Peer ID वर)
        const call = peer.call(data.caller_peer_id, stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });
        call.on('close', () => endCall());
        call.on('error', (err) => {
          console.error('Call error:', err);
          toast.error('कॉल त्रुटी');
          endCall();
        });
        socket.emit('accept_call', { caller_sid: data.caller_sid });
      } catch (err) {
        handleCameraError(err);
        socket.emit('reject_call', { caller_sid: data.caller_sid });
      }
    });

    // कॉल स्वीकारल्याची नोंद
    socket.on('call_accepted', (data) => {
      toast.success('कॉल स्वीकारला गेला');
    });

    // कॉल नकारल्याची नोंद
    socket.on('call_rejected', () => {
      toast.error('कॉल नकारला');
      endCall();
    });

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
    };
  }, [peer, cameraAvailable]);

  const handleCameraError = (err) => {
    console.error(err);
    toast.error('कॅमेरा वापरताना त्रुटी');
    setCallStatus('idle');
  };

  // ---------- 5. कॉल सुरू करा ----------
  const startCall = async (targetUser) => {
    if (!cameraAvailable) {
      toast.error('कॅमेरा उपलब्ध नाही. कृपया प्रथम कॅमेरा तपासा.');
      return;
    }
    if (!peer || !myPeerId) {
      toast.error('Peer कनेक्शन तयार होत नाही. कृपया पुन्हा प्रयत्न करा.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setCallStatus('calling');

      // Target user चा peer_id backend कडून मागवावा लागेल.
      // समजा backend ने /call/experts मध्ये 'peer_id' फील्ड दिले असेल.
      // नसल्यास हा कॉल fail होईल – backend मध्ये peer_id store करणे आवश्यक आहे.
      const targetPeerId = targetUser.peer_id;
      if (!targetPeerId) {
        toast.error('लक्ष्यित वापरकर्त्याचा Peer ID उपलब्ध नाही.');
        setCallStatus('idle');
        return;
      }

      const call = peer.call(targetPeerId, stream);
      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setCallStatus('inCall');
      });
      call.on('close', () => endCall());
      call.on('error', (err) => {
        console.error('Call error:', err);
        toast.error('कॉल करताना त्रुटी');
        endCall();
      });

      // बॅकएंडला सूचित करा की कॉल सुरू झाला आहे (socket signaling साठी)
      socket.emit('call_user', {
        target_user_id: targetUser.id,
        caller_id: currentUser.id,
        caller_name: currentUser.full_name || currentUser.name,
        caller_peer_id: myPeerId
      });
    } catch (err) {
      handleCameraError(err);
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
  };

  return (
    <div className="video-call-container">
      <h2>🎥 व्हिडिओ कॉल (खरेदीदार / तज्ञ)</h2>
      <button onClick={checkCameraDevices} className="check-cam-btn">📷 कॅमेरा तपासा</button>
      {!cameraAvailable && (
        <div className="camera-warning">
          ⚠️ कॅमेरा उपलब्ध नाही. कृपया कॅमेरा कनेक्ट करा आणि ब्राउझरला परवानगी द्या.
        </div>
      )}

      {callStatus === 'idle' && (
        <div className="expert-list">
          <h3>उपलब्ध वापरकर्ते (खरेदीदार / तज्ञ):</h3>
          {users.length === 0 ? (
            <p>सध्या कोणीही उपलब्ध नाही.</p>
          ) : (
            users.map(user => (
              <div key={user.id} className="expert-card" onClick={() => startCall(user)}>
                {user.profile_picture ? (
                  <img src={`${API}${user.profile_picture}`} alt={user.full_name} />
                ) : (
                  <div className="default-avatar">👤</div>
                )}
                <span>{user.full_name}</span>
                <small>({user.role === 'buyer' ? 'खरेदीदार' : user.role === 'farmer' ? 'शेतकरी' : 'तज्ञ'})</small>
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