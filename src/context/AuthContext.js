// import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import socket from '../socket';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       axios.get('http://localhost:8000/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       .then(res => {
//         setUser(res.data);
//       })
//       .catch(() => {
//         localStorage.removeItem('token');
//         setUser(null);
//       })
//       .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // Socket listeners – फक्त user उपलब्ध असेल तेव्हा
//   useEffect(() => {
//     if (user && user.id) {
//       socket.emit('register_user', { user_id: user.id });

//       const handleNewOrder = (data) => {
//         toast.success(data.message);
//       };
//       const handleStatusUpdate = (data) => {
//         toast.info(data.message);
//       };

//       socket.on('new_order', handleNewOrder);
//       socket.on('order_status_update', handleStatusUpdate);

//       return () => {
//         socket.off('new_order', handleNewOrder);
//         socket.off('order_status_update', handleStatusUpdate);
//       };
//     }
//   }, [user]);

//   const login = async (email, password) => {
//     try {
//       const res = await axios.post('http://localhost:8000/login', { email, password });
//       localStorage.setItem('token', res.data.access_token);
//       const userRes = await axios.get('http://localhost:8000/me', {
//         headers: { Authorization: `Bearer ${res.data.access_token}` }
//       });
//       setUser(userRes.data);
//       navigate('/dashboard');
//       return { success: true };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.detail || 'Login failed' };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import socket from '../socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Socket listeners – फक्त user उपलब्ध असेल तेव्हा
  useEffect(() => {
    if (user && user.id) {
      socket.emit('register_user', { user_id: user.id });

      const handleNewOrder = (data) => {
        toast.success(data.message);
      };
      const handleStatusUpdate = (data) => {
        toast.info(data.message);
      };

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_update', handleStatusUpdate);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_update', handleStatusUpdate);
      };
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('process.env.REACT_APP_API_URL/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      const userRes = await axios.get('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      setUser(userRes.data);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};