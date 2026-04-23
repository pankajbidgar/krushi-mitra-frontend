


import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  const [users, setUsers] = useState([]);
  const [convMap, setConvMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ----- API Calls -----

  const API = process.env.REACT_APP_API_URL;
  
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const map = {};
      (res.data || []).forEach(conv => {
        map[conv.user_id] = {
          last_message: conv.last_message || '',
          last_message_time: conv.last_message_time ? new Date(conv.last_message_time).getTime() : null,
          unread_count: conv.unread_count || 0
        };
      });
      setConvMap(map);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (userId) => {
    setLoadingMsgs(true);
    try {
      const res = await axios.get(`${API}/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setConvMap(prev => ({
        ...prev,
        [userId]: { ...prev[userId], unread_count: 0 }
      }));
    } catch (err) { console.error(err); }
    finally { setLoadingMsgs(false); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const now = Date.now();
    const msgToSend = newMessage;
    setNewMessage('');
    try {
      const res = await axios.post(`${API}/chat/send`, {
        receiver_id: selectedUser.id,
        message: msgToSend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sentMsg = {
        id: res.data.id || Date.now(),
        sender_id: user.id,
        receiver_id: selectedUser.id,
        message: msgToSend,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sentMsg]);
      setConvMap(prev => ({
        ...prev,
        [selectedUser.id]: {
          last_message: msgToSend,
          last_message_time: now,
          unread_count: 0
        }
      }));
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('हा मेसेज हटवायचा?')) return;
    try {
      await axios.delete(`${API}/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      await fetchConversations();
    } catch (err) { console.error(err); }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`"${selectedUser.full_name}" सोबतची संपूर्ण चॅट हटवायची?`)) return;
    try {
      await axios.delete(`${API}/chat/clear/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
      setConvMap(prev => {
        const newMap = { ...prev };
        delete newMap[selectedUser.id];
        return newMap;
      });
      setSelectedUser(null);
    } catch (err) { console.error(err); }
  };

  // ----- Socket Listener -----
  useEffect(() => {
    const handleNewChatMessage = (data) => {
      const now = Date.now();
      const currentSelected = selectedUserRef.current;
      if (data.receiver_id === user.id) {
        if (currentSelected && currentSelected.id === data.sender_id) {
          setMessages(prev => [...prev, data]);
          setConvMap(prev => ({
            ...prev,
            [data.sender_id]: {
              last_message: data.message,
              last_message_time: now,
              unread_count: 0
            }
          }));
        } else {
          setConvMap(prev => {
            const existing = prev[data.sender_id] || {};
            return {
              ...prev,
              [data.sender_id]: {
                last_message: data.message,
                last_message_time: now,
                unread_count: (existing.unread_count || 0) + 1
              }
            };
          });
        }
      }
    };
    socket.on('new_chat_message', handleNewChatMessage);
    return () => socket.off('new_chat_message', handleNewChatMessage);
  }, [user.id]);

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- Helper: Format message time (with date if not today) ----------
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return timeStr;
    return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${timeStr}`;
  };

  // ---------- Sidebar sorting and role display ----------
  const sidebarUsers = users
    .filter(u => {
      const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'all' || u.role === filterRole;
      return matchSearch && matchRole;
    })
    .map(u => ({
      ...u,
      last_message: convMap[u.id]?.last_message || '',
      last_message_time: convMap[u.id]?.last_message_time || 0,
      unread_count: convMap[u.id]?.unread_count || 0
    }))
    .sort((a, b) => b.last_message_time - a.last_message_time);

  const getRoleText = (role) => {
    if (role === 'farmer') return 'शेतकरी';
    if (role === 'buyer') return 'खरेदीदार';
    if (role === 'admin') return 'प्रशासक';
    return '';
  };

  // Responsive: on mobile, hide sidebar when a user is selected
  const isMobile = window.innerWidth <= 768;
  const showSidebar = !(isMobile && selectedUser);
  const showChatArea = !!selectedUser;

  // ---------- Inline Styles (responsive) ----------
  const containerStyle = { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' };
  const sidebarStyle = {
    width: isMobile ? '100%' : '320px',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    ...(isMobile && { position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 10, background: '#fff' })
  };
  const chatAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    ...(isMobile && { width: '100%' })
  };
  const sidebarHeaderStyle = { padding: '16px', borderBottom: '1px solid #ddd' };
  const filterContainerStyle = { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' };
  const searchInputStyle = { flex: 2, minWidth: '150px', padding: '8px 12px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '14px' };
  const selectStyle = { flex: 1, minWidth: '100px', padding: '8px 12px', borderRadius: '24px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '14px' };
  const userListStyle = { flex: 1, overflowY: 'auto' };
  const userItemStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0', backgroundColor: isActive ? '#e8f5e9' : 'transparent'
  });
  const avatarStyle = (size = 48) => ({
    width: size, height: size, borderRadius: '50%', backgroundColor: '#2e7d32',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', flexShrink: 0
  });
  const messagesContainerStyle = { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' };
  const messageWrapperStyle = (isSent) => ({ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', position: 'relative', marginBottom: '4px' });
  const messageBubbleStyle = (isSent) => ({
    maxWidth: '70%', padding: '8px 12px', borderRadius: '18px', backgroundColor: isSent ? '#dcf8c5' : '#f1f1f1', wordWrap: 'break-word', position: 'relative'
  });

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={sidebarStyle}>
          <div style={sidebarHeaderStyle}>
            <h3 style={{ margin: 0 }}>💬 संदेश</h3>
            <div style={filterContainerStyle}>
              <input type="text" placeholder="नाव शोधा..." value={search} onChange={e => setSearch(e.target.value)} style={searchInputStyle} />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={selectStyle}>
                <option value="all">सर्व</option>
                <option value="farmer">शेतकरी</option>
                <option value="buyer">खरेदीदार</option>
              </select>
            </div>
          </div>
          <div style={userListStyle}>
            {sidebarUsers.map(u => (
              <div key={u.id} style={userItemStyle(selectedUser?.id === u.id)} onClick={() => setSelectedUser(u)}>
                <div style={avatarStyle()}>
                  {u.profile_picture ? <img src={`${API}${u.profile_picture}`} alt={u.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {u.full_name || 'अज्ञात'}
                      &nbsp;<span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>({getRoleText(u.role)})</span>
                    </span>
                    {u.unread_count > 0 && <div style={{ background: '#2e7d32', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '11px' }}>{u.unread_count}</div>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{u.last_message.substring(0, 35)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div style={chatAreaStyle}>
        {selectedUser ? (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isMobile && (
                  <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    ←
                  </button>
                )}
                <div>
                  <strong>{selectedUser.full_name}</strong>
                  <span style={{ fontSize: '12px', marginLeft: '8px', color: '#666' }}>({getRoleText(selectedUser.role)})</span>
                </div>
              </div>
              <button onClick={clearChat} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
            </div>
            <div style={messagesContainerStyle}>
              {messages.map(msg => (
                <div key={msg.id} style={messageWrapperStyle(msg.sender_id === user.id)} onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => setHoveredMsgId(null)}>
                  <div style={messageBubbleStyle(msg.sender_id === user.id)}>
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', marginTop: '4px' }}>
                      {formatMessageTime(msg.created_at)}
                    </div>
                  </div>
                  {msg.sender_id === user.id && hoveredMsgId === msg.id && (
                    <button style={{ position: 'absolute', top: '-5px', right: '-5px', borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }} onClick={() => deleteMessage(msg.id)}>✖</button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '16px', background: '#fff', display: 'flex', gap: '10px' }}>
              <input style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="मेसेज लिहा..." />
              <button onClick={sendMessage} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>पाठवा</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            {isMobile ? "चॅट सुरू करण्यासाठी डावीकडील मेनूमधून यूजर निवडा" : "कोणतीही चॅट निवडलेली नाही"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;











// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import socket from '../socket';
// import { useAuth } from '../context/AuthContext';

// function Chat() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const userIdParam = searchParams.get('userId');

//   const [users, setUsers] = useState([]);
//   const [convMap, setConvMap] = useState({});
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [search, setSearch] = useState('');
//   const [filterRole, setFilterRole] = useState('all');
//   const [loadingMsgs, setLoadingMsgs] = useState(false);
//   const [hoveredMsgId, setHoveredMsgId] = useState(null);
//   const [showSidebarMobile, setShowSidebarMobile] = useState(false); // नवीन: मोबाइलवर साइडबार दाखवायचा का?
//   const messagesEndRef = useRef(null);
//   const token = localStorage.getItem('token');
//   const selectedUserRef = useRef(null);

//   // मोबाइल आहे का ते तपासा
//   const isMobile = window.innerWidth <= 768;

//   useEffect(() => {
//     selectedUserRef.current = selectedUser;
//   }, [selectedUser]);

//   // जेव्हा यूजर निवडला जातो, तेव्हा मोबाइलवर साइडबार लपवा
//   useEffect(() => {
//     if (isMobile && selectedUser) {
//       setShowSidebarMobile(false);
//     }
//   }, [selectedUser, isMobile]);

//   // ----- API Calls -----
//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/users/all', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUsers(res.data);
//     } catch (err) { console.error(err); }
//   };

//   const fetchConversations = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/chat/conversations', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const map = {};
//       (res.data || []).forEach(conv => {
//         map[conv.user_id] = {
//           last_message: conv.last_message || '',
//           last_message_time: conv.last_message_time ? new Date(conv.last_message_time).getTime() : null,
//           unread_count: conv.unread_count || 0
//         };
//       });
//       setConvMap(map);
//     } catch (err) { console.error(err); }
//   };

//   const fetchMessages = async (userId) => {
//     setLoadingMsgs(true);
//     try {
//       const res = await axios.get(`http://localhost:8000/chat/messages/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setMessages(res.data);
//       setConvMap(prev => ({
//         ...prev,
//         [userId]: { ...prev[userId], unread_count: 0 }
//       }));
//     } catch (err) { console.error(err); }
//     finally { setLoadingMsgs(false); }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedUser) return;
//     const now = Date.now();
//     const msgToSend = newMessage;
//     setNewMessage('');
//     try {
//       const res = await axios.post('http://localhost:8000/chat/send', {
//         receiver_id: selectedUser.id,
//         message: msgToSend
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const sentMsg = {
//         id: res.data.id || Date.now(),
//         sender_id: user.id,
//         receiver_id: selectedUser.id,
//         message: msgToSend,
//         created_at: new Date().toISOString(),
//       };
//       setMessages(prev => [...prev, sentMsg]);
//       setConvMap(prev => ({
//         ...prev,
//         [selectedUser.id]: {
//           last_message: msgToSend,
//           last_message_time: now,
//           unread_count: 0
//         }
//       }));
//     } catch (err) { console.error(err); }
//   };

//   const deleteMessage = async (messageId) => {
//     if (!window.confirm('हा मेसेज हटवायचा?')) return;
//     try {
//       await axios.delete(`http://localhost:8000/chat/messages/${messageId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setMessages(prev => prev.filter(msg => msg.id !== messageId));
//       await fetchConversations();
//     } catch (err) { console.error(err); }
//   };

//   const clearChat = async () => {
//     if (!selectedUser) return;
//     if (!window.confirm(`"${selectedUser.full_name}" सोबतची संपूर्ण चॅट हटवायची?`)) return;
//     try {
//       await axios.delete(`http://localhost:8000/chat/clear/${selectedUser.id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setMessages([]);
//       setConvMap(prev => {
//         const newMap = { ...prev };
//         delete newMap[selectedUser.id];
//         return newMap;
//       });
//       setSelectedUser(null);
//     } catch (err) { console.error(err); }
//   };

//   // ----- Socket Listener -----
//   useEffect(() => {
//     const handleNewChatMessage = (data) => {
//       const now = Date.now();
//       const currentSelected = selectedUserRef.current;
//       if (data.receiver_id === user.id) {
//         if (currentSelected && currentSelected.id === data.sender_id) {
//           setMessages(prev => [...prev, data]);
//           setConvMap(prev => ({
//             ...prev,
//             [data.sender_id]: {
//               last_message: data.message,
//               last_message_time: now,
//               unread_count: 0
//             }
//           }));
//         } else {
//           setConvMap(prev => {
//             const existing = prev[data.sender_id] || {};
//             return {
//               ...prev,
//               [data.sender_id]: {
//                 last_message: data.message,
//                 last_message_time: now,
//                 unread_count: (existing.unread_count || 0) + 1
//               }
//             };
//           });
//         }
//       }
//     };
//     socket.on('new_chat_message', handleNewChatMessage);
//     return () => socket.off('new_chat_message', handleNewChatMessage);
//   }, [user.id]);

//   // Initial load
//   useEffect(() => {
//     fetchUsers();
//     fetchConversations();
//   }, []);

//   useEffect(() => {
//     if (selectedUser) fetchMessages(selectedUser.id);
//   }, [selectedUser?.id]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const formatMessageTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const isToday = date.toDateString() === now.toDateString();
//     const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     if (isToday) return timeStr;
//     return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${timeStr}`;
//   };

//   const sidebarUsers = users
//     .filter(u => {
//       const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase());
//       const matchRole = filterRole === 'all' || u.role === filterRole;
//       return matchSearch && matchRole;
//     })
//     .map(u => ({
//       ...u,
//       last_message: convMap[u.id]?.last_message || '',
//       last_message_time: convMap[u.id]?.last_message_time || 0,
//       unread_count: convMap[u.id]?.unread_count || 0
//     }))
//     .sort((a, b) => b.last_message_time - a.last_message_time);

//   const getRoleText = (role) => {
//     if (role === 'farmer') return 'शेतकरी';
//     if (role === 'buyer') return 'खरेदीदार';
//     if (role === 'admin') return 'प्रशासक';
//     return '';
//   };

//   // Responsive styles
//   const containerStyle = { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', position: 'relative' };
//   const sidebarStyle = {
//     width: isMobile ? '85%' : '320px',
//     maxWidth: isMobile ? '280px' : '320px',
//     borderRight: '1px solid #ddd',
//     display: 'flex',
//     flexDirection: 'column',
//     backgroundColor: '#fff',
//     position: isMobile ? 'fixed' : 'relative',
//     top: 0,
//     left: 0,
//     bottom: 0,
//     zIndex: 20,
//     transform: isMobile && !showSidebarMobile ? 'translateX(-100%)' : 'translateX(0)',
//     transition: 'transform 0.3s ease',
//     boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
//   };
//   const chatAreaStyle = {
//     flex: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     backgroundColor: '#fafafa',
//     width: '100%'
//   };
//   const sidebarHeaderStyle = { padding: '16px', borderBottom: '1px solid #ddd' };
//   const filterContainerStyle = { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' };
//   const searchInputStyle = { flex: 2, minWidth: '150px', padding: '8px 12px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '14px' };
//   const selectStyle = { flex: 1, minWidth: '100px', padding: '8px 12px', borderRadius: '24px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '14px' };
//   const userListStyle = { flex: 1, overflowY: 'auto' };
//   const userItemStyle = (isActive) => ({
//     display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer',
//     borderBottom: '1px solid #f0f0f0', backgroundColor: isActive ? '#e8f5e9' : 'transparent'
//   });
//   const avatarStyle = (size = 48) => ({
//     width: size, height: size, borderRadius: '50%', backgroundColor: '#2e7d32',
//     display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', flexShrink: 0
//   });
//   const messagesContainerStyle = { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' };
//   const messageWrapperStyle = (isSent) => ({ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', position: 'relative', marginBottom: '4px' });
//   const messageBubbleStyle = (isSent) => ({
//     maxWidth: '70%', padding: '8px 12px', borderRadius: '18px', backgroundColor: isSent ? '#dcf8c5' : '#f1f1f1', wordWrap: 'break-word', position: 'relative'
//   });
//   const menuButtonStyle = {
//     background: 'none',
//     border: 'none',
//     fontSize: '1.5rem',
//     cursor: 'pointer',
//     marginRight: '12px',
//     display: isMobile ? 'block' : 'none',
//     color: '#333'
//   };

//   return (
//     <div style={containerStyle}>
//       {/* Sidebar */}
//       <div style={sidebarStyle}>
//         <div style={sidebarHeaderStyle}>
//           <h3 style={{ margin: 0 }}>💬 संदेश</h3>
//           <div style={filterContainerStyle}>
//             <input type="text" placeholder="नाव शोधा..." value={search} onChange={e => setSearch(e.target.value)} style={searchInputStyle} />
//             <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={selectStyle}>
//               <option value="all">सर्व</option>
//               <option value="farmer">शेतकरी</option>
//               <option value="buyer">खरेदीदार</option>
//             </select>
//           </div>
//         </div>
//         <div style={userListStyle}>
//           {sidebarUsers.map(u => (
//             <div key={u.id} style={userItemStyle(selectedUser?.id === u.id)} onClick={() => setSelectedUser(u)}>
//               <div style={avatarStyle()}>
//                 {u.profile_picture ? <img src={`http://localhost:8000${u.profile_picture}`} alt={u.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <span style={{ fontWeight: 'bold' }}>
//                     {u.full_name || 'अज्ञात'}
//                     &nbsp;<span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>({getRoleText(u.role)})</span>
//                   </span>
//                   {u.unread_count > 0 && <div style={{ background: '#2e7d32', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '11px' }}>{u.unread_count}</div>}
//                 </div>
//                 <div style={{ fontSize: '12px', color: '#888' }}>{u.last_message.substring(0, 35)}...</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div style={chatAreaStyle}>
//         {selectedUser ? (
//           <>
//             <div style={{ padding: '16px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                 {isMobile && (
//                   <button onClick={() => setShowSidebarMobile(true)} style={menuButtonStyle}>
//                     ☰
//                   </button>
//                 )}
//                 <div>
//                   <strong>{selectedUser.full_name}</strong>
//                   <span style={{ fontSize: '12px', marginLeft: '8px', color: '#666' }}>({getRoleText(selectedUser.role)})</span>
//                 </div>
//               </div>
//               <button onClick={clearChat} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
//             </div>
//             <div style={messagesContainerStyle}>
//               {messages.map(msg => (
//                 <div key={msg.id} style={messageWrapperStyle(msg.sender_id === user.id)} onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => setHoveredMsgId(null)}>
//                   <div style={messageBubbleStyle(msg.sender_id === user.id)}>
//                     <div>{msg.message}</div>
//                     <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', marginTop: '4px' }}>
//                       {formatMessageTime(msg.created_at)}
//                     </div>
//                   </div>
//                   {msg.sender_id === user.id && hoveredMsgId === msg.id && (
//                     <button style={{ position: 'absolute', top: '-5px', right: '-5px', borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }} onClick={() => deleteMessage(msg.id)}>✖</button>
//                   )}
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//             <div style={{ padding: '16px', background: '#fff', display: 'flex', gap: '10px' }}>
//               <input style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="मेसेज लिहा..." />
//               <button onClick={sendMessage} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>पाठवा</button>
//             </div>
//           </>
//         ) : (
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexDirection: 'column', gap: '16px' }}>
//             {isMobile && (
//               <button onClick={() => setShowSidebarMobile(true)} style={{ ...menuButtonStyle, fontSize: '2rem', background: '#2e7d32', color: 'white', padding: '10px 20px', borderRadius: '40px' }}>
//                 ☰ संदेश पाहा
//               </button>
//             )}
//             <div>कोणतीही चॅट निवडलेली नाही</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Chat;


