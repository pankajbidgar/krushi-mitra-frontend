// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Login from './components/Login';
// import Register from './components/Register';
// import FarmerDashboard from './components/FarmerDashboard';
// import BuyerDashboard from './components/BuyerDashboard';
// import PrivateRoute from './components/PrivateRoute';
// import AddProduct from './components/AddProduct';
// import MyProducts from './components/MyProducts';
// import BuyerProducts from './components/BuyerProducts';
// import Cart from './components/Cart';
// import MyOrders from './components/Myorders';
// import FarmerOrders from './components/FarmerOrders';
// import { NotificationProvider } from './context/NotificationContext';

// function AppContent() {
//   const { user } = useAuth();

//   return (
//     <>
//       <Toaster position="top-right" reverseOrder={false} />
//       {user && <Navbar />}
//       <Routes>

//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path='/farmer/add-products' element={
//           <PrivateRoute allowedRoles={['farmer']}><AddProduct/></PrivateRoute>
//         } />
//         <Route path='/farmer/my-products' element={
//           <PrivateRoute allowedRoles={['farmer']}>
//             <MyProducts/>
//           </PrivateRoute>
//         }/>
//         <Route path='/farmer/orders' element={
//           <PrivateRoute allowedRoles={['farmer']}>
//             <FarmerOrders/>

//           </PrivateRoute>
          
//         }/>
//         <Route path='/buyer/products' element={
//           <PrivateRoute allowedRoles={['buyer']}>
//             <BuyerProducts/>
//           </PrivateRoute>
//         }/>
//         <Route path='/buyer/cart' element={
//           <PrivateRoute allowedRoles={['buyer']}>
//             <Cart/>
//           </PrivateRoute>
//         }/>

//         <Route path="/buyer/orders" element={<PrivateRoute allowedRoles={['buyer']}><MyOrders /></PrivateRoute>} />


//         <Route path="/dashboard" element={
//           <PrivateRoute>
//             {user?.role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />}
//           </PrivateRoute>
//         } />
//         <Route path="/" element={<Navigate to="/login" />} />
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <NotificationProvider>
//         <AppContent />
//         </NotificationProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import FarmerDashboard from './components/Farmer/FarmerDashboard';
import BuyerDashboard from './components/Buyer/BuyerDashboard';
import PrivateRoute from './components/PrivateRoute';
import AddProduct from './components/Farmer/AddProduct';
import MyProducts from './components/Farmer/MyProducts';
import BuyerProducts from './components/Buyer/BuyerProducts';
import Cart from './components/Buyer/Cart';
import MyOrders from './components/Myorders';
import FarmerOrders from './components/Farmer/FarmerOrders';
import socket from './socket';
import toast from 'react-hot-toast';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';

import { ChatProvider } from './context/ChatContext';

import Chat from './components/Chat';
import ForgotPassword from './components/ForgetPassword';
import CropRecommendation from './pages/CropRecommendation';
import MarketPrices from './pages/MarketPrices';
import WeatherAdvice from './pages/MeatherAdvice';
import Chatbot from './pages/Chatbot';
import DiseaseDetection from './pages/DiseaseDetection';

function SocketListeners() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    socket.emit('register_user', { user_id: user.id });

    const handleNewOrder = (data) => {
      toast.success(data.message);
      addNotification(
        'नवीन ऑर्डर!',
        `ऑर्डर #${data.order_id} आला. एकूण ₹${data.total}`,
        'order',
        user.role === 'farmer' ? '/farmer/orders' : '/buyer/orders'
      );
    };

    const handleStatusUpdate = (data) => {
      toast.info(data.message);
      addNotification(
        'ऑर्डर स्टेटस बदलला',
        data.message,
        'status',
        '/buyer/orders'
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [user, addNotification]);

  return null;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <SocketListeners />
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer/add-products" element={<PrivateRoute allowedRoles={['farmer']}><AddProduct /></PrivateRoute>} />
        <Route path="/farmer/my-products" element={<PrivateRoute allowedRoles={['farmer']}><MyProducts /></PrivateRoute>} />
        <Route path="/farmer/orders" element={<PrivateRoute allowedRoles={['farmer']}><FarmerOrders /></PrivateRoute>} />
        <Route path="/buyer/products" element={<PrivateRoute allowedRoles={['buyer']}><BuyerProducts /></PrivateRoute>} />
        <Route path="/buyer/cart" element={<PrivateRoute allowedRoles={['buyer']}><Cart /></PrivateRoute>} />
        <Route path="/buyer/orders" element={<PrivateRoute allowedRoles={['buyer']}><MyOrders /></PrivateRoute>} />
        <Route path = "/admin/dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard/>
          </PrivateRoute>
        }/>
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile/>
          </PrivateRoute>
        }/>


        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path='forgot-password' element={< ForgotPassword/>} />
        <Route path='/crop-recommendation' element={
          <PrivateRoute>
            <CropRecommendation/>
          </PrivateRoute>
        }/>
        <Route path='/market-prices' element={
          <PrivateRoute>
            <MarketPrices/>
          </PrivateRoute>
        }/>

        <Route path='/weather-advice' element={
          <PrivateRoute>
            <WeatherAdvice/>
          </PrivateRoute>
        }/>
        <Route path='/chatbot' element={
          <PrivateRoute>
            <Chatbot/>
          </PrivateRoute>
        }/>
        <Route path='/disease-detection' element={
          <PrivateRoute>
            <DiseaseDetection/>
          </PrivateRoute>
        }/>

        <Route path="/dashboard" element={
          <PrivateRoute>
            {user?.role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />}
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
          <AppContent />
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;