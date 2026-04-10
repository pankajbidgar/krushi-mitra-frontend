import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/chat/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadChatCount(res.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread chat count', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // प्रत्येक 10 सेकंदांनी refresh
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handleNewChatMessage = (data) => {
      if (data.receiver_id === user.id) {
        setUnreadChatCount(prev => prev + 1);
      }
    };
    socket.on('new_chat_message', handleNewChatMessage);
    return () => socket.off('new_chat_message', handleNewChatMessage);
  }, [user]);

  return (
    <ChatContext.Provider value={{ unreadChatCount, fetchUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};