// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function NewChat() {
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState('');
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     axios.get('http://localhost:8000/users/all', {
//       headers: { Authorization: `Bearer ${token}` }
//     }).then(res => setUsers(res.data));
//   }, []);

//   const filteredUsers = users.filter(u =>
//     u.full_name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="new-chat-container">
//       <h2>नवीन संदेश</h2>
//       <input type="text" placeholder="नाव शोधा..." value={search} onChange={e => setSearch(e.target.value)} />
//       {filteredUsers.map(u => (
//         <div key={u.id} className="user-item" onClick={() => navigate(`/chat/${u.id}`)}>
//           <strong>{u.full_name}</strong> <span>({u.role === 'farmer' ? 'शेतकरी' : (u.role === 'buyer' ? 'खरेदीदार' : 'प्रशासक')})</span>
//         </div>
//       ))}
//     </div>
//   );
// }
// export default NewChat;