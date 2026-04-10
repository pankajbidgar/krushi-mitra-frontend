

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
//   const messagesEndRef = useRef(null);
//   const token = localStorage.getItem('token');

//   const selectedUserRef = useRef(null);
//   useEffect(() => {
//     selectedUserRef.current = selectedUser;
//   }, [selectedUser]);

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

//   // ---------- Sidebar sorting and role display ----------
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

//   // Helper to get role text
//   const getRoleText = (role) => {
//     if (role === 'farmer') return 'शेतकरी';
//     if (role === 'buyer') return 'खरेदीदार';
//     if (role === 'admin') return 'प्रशासक';
//     return '';
//   };

//   // ---------- Styles (same as your working code) ----------
//   const containerStyle = { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' };
//   const sidebarStyle = { width: '320px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' };
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
//   const chatAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' };
//   const messagesContainerStyle = { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' };
//   const messageWrapperStyle = (isSent) => ({ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', position: 'relative', marginBottom: '4px' });
//   const messageBubbleStyle = (isSent) => ({
//     maxWidth: '70%', padding: '8px 12px', borderRadius: '18px', backgroundColor: isSent ? '#dcf8c5' : '#f1f1f1', wordWrap: 'break-word', position: 'relative'
//   });

//   return (
//     <div style={containerStyle}>
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

//       <div style={chatAreaStyle}>
//         {selectedUser ? (
//           <>
//             <div style={{ padding: '16px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div>
//                 <strong> {selectedUser.full_name}</strong>
                
//                 <span style={{ fontSize: '12px', marginLeft: '8px', color: '#666' }}>({getRoleText(selectedUser.role)})</span>
//               </div>
//               <button onClick={clearChat} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
//             </div>
//             <div style={messagesContainerStyle}>
//               {messages.map(msg => (
//                 <div key={msg.id} style={messageWrapperStyle(msg.sender_id === user.id)} onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => setHoveredMsgId(null)}>
//                   <div style={messageBubbleStyle(msg.sender_id === user.id)}>
//                     <div>{msg.message}</div>
//                     <div style={{ fontSize: '10px', color: '#888', textAlign: 'right' }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>कोणतीही चॅट निवडलेली नाही</div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Chat;



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const { user } = useAuth();
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

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/chat/conversations', {
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
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Fetch messages with selected user
  const fetchMessages = useCallback(async (userId) => {
    setLoadingMsgs(true);
    try {
      const res = await axios.get(`http://localhost:8000/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setConvMap(prev => ({
        ...prev,
        [userId]: { ...prev[userId], unread_count: 0 }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [token]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const now = Date.now();
    try {
      await axios.post('http://localhost:8000/chat/send', {
        receiver_id: selectedUser.id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: selectedUser.id,
        message: newMessage,
        created_at: new Date().toISOString(),
      }]);
      setConvMap(prev => ({
        ...prev,
        [selectedUser.id]: {
          last_message: newMessage,
          last_message_time: now,
          unread_count: 0
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('हा मेसेज हटवायचा?')) return;
    try {
      await axios.delete(`http://localhost:8000/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      await fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`"${selectedUser.full_name}" सोबतची संपूर्ण चॅट हटवायची?`)) return;
    try {
      await axios.delete(`http://localhost:8000/chat/clear/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
      setConvMap(prev => {
        const newMap = { ...prev };
        delete newMap[selectedUser.id];
        return newMap;
      });
      await fetchConversations();
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Socket listener
  useEffect(() => {
    const handleNewChatMessage = (data) => {
      const now = Date.now();
      if (data.receiver_id === user.id) {
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
        if (selectedUser && selectedUser.id === data.sender_id) {
          setMessages(prev => [...prev, data]);
          setConvMap(prev => ({
            ...prev,
            [data.sender_id]: { ...prev[data.sender_id], unread_count: 0 }
          }));
        }
      } else if (data.sender_id === user.id && selectedUser && selectedUser.id === data.receiver_id) {
        setConvMap(prev => ({
          ...prev,
          [data.receiver_id]: {
            ...prev[data.receiver_id],
            last_message: data.message,
            last_message_time: now
          }
        }));
      }
    };
    socket.on('new_chat_message', handleNewChatMessage);
    return () => socket.off('new_chat_message', handleNewChatMessage);
  }, [user.id, selectedUser]);

  // Auto-select user from URL param
  useEffect(() => {
    if (userIdParam && users.length > 0) {
      const target = users.find(u => u.id === parseInt(userIdParam));
      if (target) {
        setSelectedUser(target);
        fetchMessages(target.id);
        // Navigate without param to prevent re-selection
        window.history.replaceState(null, '', '/chat');
      }
    }
  }, [userIdParam, users, fetchMessages]);

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchConversations();
  }, [fetchUsers, fetchConversations]);

  // Load messages when selected user changes
  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build sidebar with sorting
  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const sidebarUsers = filteredUsers
    .map(u => ({
      ...u,
      last_message: convMap[u.id]?.last_message || '',
      last_message_time: convMap[u.id]?.last_message_time || 0,
      unread_count: convMap[u.id]?.unread_count || 0
    }))
    .sort((a, b) => b.last_message_time - a.last_message_time);

  // Inline styles (keep your existing styles – they are fine)
  const containerStyle = { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' };
  const sidebarStyle = { width: '320px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' };
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
  const userNameStyle = { fontWeight: 'bold', color: '#000000', fontSize: '15px' };
  const roleTagStyle = { fontSize: '11px', color: '#666', marginLeft: '6px' };
  const lastMessageStyle = { fontSize: '12px', color: '#888', marginTop: '2px' };
  const unreadBadgeStyle = {
    backgroundColor: '#2e7d32', color: 'white', borderRadius: '50%', minWidth: '20px', height: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', padding: '0 4px'
  };
  const chatAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' };
  const chatHeaderStyle = { padding: '16px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' };
  const chatUserInfoStyle = { display: 'flex', alignItems: 'center', gap: '12px' };
  const chatActionsStyle = { display: 'flex', gap: '8px' };
  const actionButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', borderRadius: '20px' };
  const messagesContainerStyle = { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' };
  const messageWrapperStyle = (isSent) => ({
    display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', position: 'relative', marginBottom: '4px'
  });
  const messageBubbleStyle = (isSent) => ({
    maxWidth: '70%', padding: '8px 12px', borderRadius: '18px', backgroundColor: isSent ? '#dcf8c5' : '#f1f1f1',
    wordWrap: 'break-word', position: 'relative'
  });
  const messageTimeStyle = { fontSize: '10px', color: '#888', marginTop: '4px', textAlign: 'right' };
  const deleteMsgBtnStyle = {
    position: 'absolute', top: '-8px', right: '-8px', background: '#fff', border: '1px solid #ccc',
    borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  };
  const inputAreaStyle = { padding: '16px', borderTop: '1px solid #ddd', display: 'flex', gap: '12px', backgroundColor: '#fff' };
  const inputStyle = { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '14px' };
  const sendButtonStyle = { padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer' };
  const placeholderStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '16px' };

  return (
    <div style={containerStyle}>
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
                {u.profile_picture ? <img src={`http://localhost:8000${u.profile_picture}`} alt={u.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div><span style={userNameStyle}>{u.full_name}</span><span style={roleTagStyle}>({u.role === 'farmer' ? 'शेतकरी' : 'खरेदीदार'})</span></div>
                {u.last_message && <div style={lastMessageStyle}>{u.last_message.substring(0, 45)}</div>}
              </div>
              {u.unread_count > 0 && <div style={unreadBadgeStyle}>{u.unread_count}</div>}
            </div>
          ))}
          {sidebarUsers.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>कोणतेही यूजर नाहीत</div>}
        </div>
      </div>

      <div style={chatAreaStyle}>
        {selectedUser ? (
          <>
            <div style={chatHeaderStyle}>
              <div style={chatUserInfoStyle}>
                <div style={avatarStyle(40)}>
                  {selectedUser.profile_picture ? <img src={`http://localhost:8000${selectedUser.profile_picture}`} alt={selectedUser.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
                </div>
                <div>
                  <strong>{selectedUser.full_name}</strong>
                  <small>({selectedUser.role === 'farmer' ? 'शेतकरी' : 'खरेदीदार'})</small>
                </div>
              </div>
              <div style={chatActionsStyle}>
                <button onClick={clearChat} style={actionButtonStyle} title="चॅट हटवा">🗑️</button>
              </div>
            </div>
            <div style={messagesContainerStyle}>
              {loadingMsgs && <div>लोड करत आहे...</div>}
              {messages.map(msg => (
                <div key={msg.id} style={messageWrapperStyle(msg.sender_id === user.id)} onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => setHoveredMsgId(null)}>
                  <div style={messageBubbleStyle(msg.sender_id === user.id)}>
                    <div>{msg.message}</div>
                    <div style={messageTimeStyle}>{new Date(msg.created_at).toLocaleTimeString()}</div>
                  </div>
                  {msg.sender_id === user.id && hoveredMsgId === msg.id && (
                    <button style={deleteMsgBtnStyle} onClick={() => deleteMessage(msg.id)}>✖</button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={inputAreaStyle}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="मेसेज लिहा..." style={inputStyle} />
              <button onClick={sendMessage} style={sendButtonStyle}>पाठवा</button>
            </div>
          </>
        ) : (
          <div style={placeholderStyle}>कोणतीही चॅट निवडलेली नाही</div>
        )}
      </div>
    </div>
  );
}

export default Chat;