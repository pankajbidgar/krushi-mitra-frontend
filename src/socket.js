

// import { io } from 'socket.io-client';
// const socket = io(process.env.REACT_APP_API_URL);
// export default socket;




import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['websocket'],   // 🔥 important fix
  withCredentials: true,
});

export default socket;
