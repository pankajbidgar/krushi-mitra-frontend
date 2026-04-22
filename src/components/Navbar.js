

// import React, { useState, useEffect, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useNotifications } from '../context/NotificationContext';
// import { useChat } from '../context/ChatContext';
// import toast from 'react-hot-toast';
// import { FaWhatsapp } from 'react-icons/fa';
// import '../style/Navbar.css';

// function Navbar() {
//   const { user, logout } = useAuth();
//   const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
//   const { unreadChatCount } = useChat();
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
  
//   // तीन नवीन ड्रॉपडाउनसाठी स्टेट्स
//   const [showFarmingAdvice, setShowFarmingAdvice] = useState(false);
//   const [showAiAssistants, setShowAiAssistants] = useState(false);
//   const [showManagement, setShowManagement] = useState(false);
//   const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);
//   const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  
//   const [profileImageError, setProfileImageError] = useState(false);
  
//   // रेफरन्सेस
//   const menuRef = useRef(null);
//   const notifRef = useRef(null);
//   const profileRef = useRef(null);
//   const farmingAdviceRef = useRef(null);
//   const aiAssistantsRef = useRef(null);
//   const managementRef = useRef(null);
//   const farmerDropdownRef = useRef(null);
//   const buyerDropdownRef = useRef(null);

//   // Click outside handler for all dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
//       if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
//       if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
//       if (farmingAdviceRef.current && !farmingAdviceRef.current.contains(event.target)) setShowFarmingAdvice(false);
//       if (aiAssistantsRef.current && !aiAssistantsRef.current.contains(event.target)) setShowAiAssistants(false);
//       if (managementRef.current && !managementRef.current.contains(event.target)) setShowManagement(false);
//       if (farmerDropdownRef.current && !farmerDropdownRef.current.contains(event.target)) setShowFarmerDropdown(false);
//       if (buyerDropdownRef.current && !buyerDropdownRef.current.contains(event.target)) setShowBuyerDropdown(false);
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     toast.success('लॉगआउट यशस्वी!', { position: 'top-right' });
//     navigate('/login');
//   };

//   const handleNotificationClick = (notif) => {
//     markAsRead(notif.id);
//     setShowNotifications(false);
//     if (notif.link) navigate(notif.link);
//   };

//   if (!user) return null;

//   // Common links
//   const commonLinks = [{ to: '/dashboard', label: '📊 डॅशबोर्ड' }];

//   // 1. शेती सल्ला (Farming Advice)
//   const farmingAdviceLinks = [
//     { to: '/crop-recommendation', label: '🌾 पीक शिफारस' },
//     { to: '/weather-advice', label: '🌤️ हवामान सल्ला' },
//     { to: '/soil-moisture', label: '💧 माती ओलावा' },
//     { to: '/farmer/irrigation', label: '💧 सिंचन शेड्यूलर' },
//     { to: '/farmer/yield-prediction', label: '🌾 उत्पादन अंदाज' },
//   ];

//   // 2. AI सहाय्यक (AI Assistants)
//   const aiAssistantsLinks = [
//     { to: '/chatbot', label: '🤖 शेती सहाय्यक (चॅट)' },
//     { to: '/disease-detection', label: '🌿 रोग ओळख' },
//     { to: '/video-call', label: '🎥 व्हिडिओ कॉल' },
//     { to: '/voice-assistant', label: '🎤 व्हॉईस असिस्टंट' },
//     { to: '/market-prices', label: '📊 मंडी भाव' },
//     { to: '/scheme-finder', label: '📢 सरकारी योजना' },
//   ];

//   // 3. व्यवस्थापन (Management)
//   const managementLinks = [
//     { to: '/farmer/tasks', label: '📋 फार्म जर्नल' },
//     { to: '/farmer/farm-management', label: '🌾 शेत व्यवस्थापन' },
//     { to: '/farmer/profit-report', label: '📊 नफा/तोटा अहवाल' },
//   ];

//   // Farmer marketplace links
//   const farmerMarketLinks = [
//     { to: '/farmer/add-products', label: '🌾 उत्पादन जोडा' },
//     { to: '/farmer/my-products', label: '📦 माझी उत्पादने' },
//     { to: '/farmer/orders', label: '📋 माझ्या ऑर्डर' },
//     { to: '/farmer/profit-report', label: '📊 नफा/तोटा अहवाल' },
//     { to: '/farmer/create-auction', label: '🔨 लिलाव तयार करा' },
//     { to: '/farmer/my-auctions', label: '📋 माझे लिलाव' },
//   ];

//   // Buyer marketplace links
//   const buyerMarketLinks = [
//     { to: '/buyer/products', label: '🛒 उत्पादने बघा' },
//     { to: '/buyer/orders', label: '📋 माझे ऑर्डर' },
//     { to: '/buyer/cart', label: '🛍️ कार्ट' },
//     { to: '/auctions', label: '🔨 सक्रिय लिलाव' },
//   ];

//   const adminLink = { to: '/admin/dashboard', label: '🔧 Admin पॅनल' };

//   let roleText = '';
//   if (user.role === 'farmer') roleText = 'शेतकरी';
//   else if (user.role === 'buyer') roleText = 'खरेदीदार';
//   else if (user.role === 'admin') roleText = 'प्रशासक';

//   const profilePicUrl = user.profile_picture && !profileImageError
//     ? `http://localhost:8000${user.profile_picture}?t=${Date.now()}`
//     : null;

//   const handleImageError = () => setProfileImageError(true);

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <Link to="/dashboard" className="navbar-logo">🌾 कृषि मित्र</Link>

//         {/* Desktop Menu */}
//         <div className="nav-menu desktop">
//           {commonLinks.map(link => (
//             <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
//           ))}

//           {/* 1. शेती सल्ला ड्रॉपडाउन */}
//           <div className="dropdown-wrapper" ref={farmingAdviceRef}>
//             <button className="dropdown-btn" onClick={() => setShowFarmingAdvice(!showFarmingAdvice)}>
//               🌱 शेती सल्ला ▼
//             </button>
//             {showFarmingAdvice && (
//               <div className="dropdown-content">
//                 {farmingAdviceLinks.map(link => (
//                   <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowFarmingAdvice(false)}>
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* 2. AI सहाय्यक ड्रॉपडाउन */}
//           <div className="dropdown-wrapper" ref={aiAssistantsRef}>
//             <button className="dropdown-btn" onClick={() => setShowAiAssistants(!showAiAssistants)}>
//               🤖 AI सहाय्यक ▼
//             </button>
//             {showAiAssistants && (
//               <div className="dropdown-content">
//                 {aiAssistantsLinks.map(link => (
//                   <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowAiAssistants(false)}>
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* 3. व्यवस्थापन ड्रॉपडाउन */}
//           <div className="dropdown-wrapper" ref={managementRef}>
//             <button className="dropdown-btn" onClick={() => setShowManagement(!showManagement)}>
//               📊 व्यवस्थापन ▼
//             </button>
//             {showManagement && (
//               <div className="dropdown-content">
//                 {managementLinks.map(link => (
//                   <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowManagement(false)}>
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Role-specific marketplace dropdowns */}
//           {user.role === 'farmer' && (
//             <div className="dropdown-wrapper" ref={farmerDropdownRef}>
//               <button className="dropdown-btn" onClick={() => setShowFarmerDropdown(!showFarmerDropdown)}>
//                 🌾 शेतकरी बाजार ▼
//               </button>
//               {showFarmerDropdown && (
//                 <div className="dropdown-content">
//                   {farmerMarketLinks.map(link => (
//                     <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowFarmerDropdown(false)}>
//                       {link.label}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {user.role === 'buyer' && (
//             <div className="dropdown-wrapper" ref={buyerDropdownRef}>
//               <button className="dropdown-btn" onClick={() => setShowBuyerDropdown(!showBuyerDropdown)}>
//                 🛒 खरेदीदार बाजार ▼
//               </button>
//               {showBuyerDropdown && (
//                 <div className="dropdown-content">
//                   {buyerMarketLinks.map(link => (
//                     <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowBuyerDropdown(false)}>
//                       {link.label}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {user.role === 'admin' && (
//             <Link to={adminLink.to} className="nav-link">{adminLink.label}</Link>
//           )}

//           {/* Chat Icon */}
//           <Link to="/chat" className="chat-icon-wrapper">
//             <button className="chat-btn">
//               <FaWhatsapp /> {unreadChatCount > 0 && <span className="badge">{unreadChatCount}</span>}
//             </button>
//           </Link>

//           {/* Notification Bell */}
//           <div className="notification-bell-wrapper" ref={notifRef}>
//             <button className="bell-btn" onClick={() => setShowNotifications(!showNotifications)}>
//               🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
//             </button>
//             {showNotifications && (
//               <div className="notifications-dropdown">
//                 <div className="notifications-header">
//                   <span>📢 सूचना</span>
//                   {notifications.length > 0 && <button onClick={markAllAsRead} className="mark-read-btn">सर्व वाचा</button>}
//                 </div>
//                 <div className="notifications-list">
//                   {notifications.length === 0 ? (
//                     <div className="no-notifications">कोणतीही सूचना नाही</div>
//                   ) : (
//                     notifications.map(notif => (
//                       <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(notif)}>
//                         <div className="notif-title">{notif.title}</div>
//                         <div className="notif-message">{notif.message}</div>
//                         <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
//                         <button className="notif-close" onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}>✖</button>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Profile Dropdown */}
//           <div className="profile-dropdown-wrapper" ref={profileRef}>
//             <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
//               {profilePicUrl ? (
//                 <img src={profilePicUrl} alt="profile" className="profile-avatar-navbar" onError={handleImageError} />
//               ) : (
//                 <span className="profile-icon">👤</span>
//               )}
//               <span className="profile-name">{user.full_name}</span>
//               <span className="dropdown-arrow">▼</span>
//             </button>
//             {showProfileMenu && (
//               <div className="profile-dropdown">
//                 <Link to="/profile" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>👤 माझे प्रोफाइल</Link>
//                 <button onClick={handleLogout} className="profile-dropdown-item logout-item">🚪 लॉगआउट</button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile Hamburger */}
//         <div className="menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//           {mobileMenuOpen ? '✕' : '☰'}
//         </div>
//       </div>

//       {/* Mobile Menu – स्क्रोल करता येईल, तीन विभाग */}
//       {mobileMenuOpen && (
//         <div className="mobile-menu" ref={menuRef}>
//           {commonLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
          
//           <div className="mobile-section-title">🌱 शेती सल्ला</div>
//           {farmingAdviceLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
          
//           <div className="mobile-section-title">🤖 AI सहाय्यक</div>
//           {aiAssistantsLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
          
//           <div className="mobile-section-title">📊 व्यवस्थापन</div>
//           {managementLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}

//           {user.role === 'farmer' && (
//             <>
//               <div className="mobile-section-title">🌾 शेतकरी बाजार</div>
//               {farmerMarketLinks.map(link => (
//                 <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   {link.label}
//                 </Link>
//               ))}
//             </>
//           )}
//           {user.role === 'buyer' && (
//             <>
//               <div className="mobile-section-title">🛒 खरेदीदार बाजार</div>
//               {buyerMarketLinks.map(link => (
//                 <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//                   {link.label}
//                 </Link>
//               ))}
//             </>
//           )}
//           {user.role === 'admin' && (
//             <Link to={adminLink.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {adminLink.label}
//             </Link>
//           )}
//           <Link to="/chat" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>💬 संदेश</Link>
//           <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>👤 माझे प्रोफाइल</Link>
//           <div className="mobile-user-info">
//             <span className="mobile-user-name">👋 {user.full_name}</span>
//             <button onClick={handleLogout} className="logout-btn">लॉगआउट</button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;



import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import '../style/Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { unreadChatCount } = useChat();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFarmingAdvice, setShowFarmingAdvice] = useState(false);
  const [showAiAssistants, setShowAiAssistants] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const farmingAdviceRef = useRef(null);
  const aiAssistantsRef = useRef(null);
  const managementRef = useRef(null);
  const farmerDropdownRef = useRef(null);
  const buyerDropdownRef = useRef(null);

  // Click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (farmingAdviceRef.current && !farmingAdviceRef.current.contains(event.target)) setShowFarmingAdvice(false);
      if (aiAssistantsRef.current && !aiAssistantsRef.current.contains(event.target)) setShowAiAssistants(false);
      if (managementRef.current && !managementRef.current.contains(event.target)) setShowManagement(false);
      if (farmerDropdownRef.current && !farmerDropdownRef.current.contains(event.target)) setShowFarmerDropdown(false);
      if (buyerDropdownRef.current && !buyerDropdownRef.current.contains(event.target)) setShowBuyerDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('लॉगआउट यशस्वी!', { position: 'top-right' });
    navigate('/login');
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  if (!user) return null;

  // Common links
  const commonLinks = [{ to: '/dashboard', label: '📊 डॅशबोर्ड' }];

  // 1. शेती सल्ला (Farming Advice)
  const farmingAdviceLinks = [
    { to: '/crop-recommendation', label: '🌾 पीक शिफारस' },
    { to: '/weather-advice', label: '🌤️ हवामान सल्ला' },
    { to: '/soil-moisture', label: '💧 माती ओलावा' },
    { to: '/farmer/irrigation', label: '💧 सिंचन शेड्यूलर' },
    { to: '/farmer/yield-prediction', label: '🌾 उत्पादन अंदाज' },
  ];

  // 2. AI सहाय्यक (AI Assistants)
  const aiAssistantsLinks = [
    { to: '/chatbot', label: '🤖 शेती सहाय्यक (चॅट)' },
    { to: '/disease-detection', label: '🌿 रोग ओळख' },
    { to: '/video-call', label: '🎥 व्हिडिओ कॉल' },
    { to: '/voice-assistant', label: '🎤 व्हॉईस असिस्टंट' },
    { to: '/market-prices', label: '📊 मंडी भाव' },
    { to: '/scheme-finder', label: '📢 सरकारी योजना' },
  ];

  // 3. व्यवस्थापन (Management)
  const managementLinks = [
    { to: '/farmer/tasks', label: '📋 फार्म जर्नल' },
    { to: '/farmer/farm-management', label: '🌾 शेत व्यवस्थापन' },
    { to: '/farmer/profit-report', label: '📊 नफा/तोटा अहवाल' },
  ];

  // Farmer marketplace links
  const farmerMarketLinks = [
    { to: '/farmer/add-products', label: '🌾 उत्पादन जोडा' },
    { to: '/farmer/my-products', label: '📦 माझी उत्पादने' },
    { to: '/farmer/orders', label: '📋 माझ्या ऑर्डर' },
    { to: '/farmer/profit-report', label: '📊 नफा/तोटा अहवाल' },
    { to: '/farmer/create-auction', label: '🔨 लिलाव तयार करा' },
    { to: '/farmer/my-auctions', label: '📋 माझे लिलाव' },
  ];

  // Buyer marketplace links
  const buyerMarketLinks = [
    { to: '/buyer/products', label: '🛒 उत्पादने बघा' },
    { to: '/buyer/orders', label: '📋 माझे ऑर्डर' },
    { to: '/buyer/cart', label: '🛍️ कार्ट' },
    { to: '/auctions', label: '🔨 सक्रिय लिलाव' },
  ];

  const adminLink = { to: '/admin/dashboard', label: '🔧 Admin पॅनल' };

  let roleText = '';
  if (user.role === 'farmer') roleText = 'शेतकरी';
  else if (user.role === 'buyer') roleText = 'खरेदीदार';
  else if (user.role === 'admin') roleText = 'प्रशासक';

  const profilePicUrl = user.profile_picture && !profileImageError
    ? `http://localhost:8000${user.profile_picture}?t=${Date.now()}`
    : null;

  const handleImageError = () => setProfileImageError(true);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">🌾 कृषि मित्र</Link>

        {/* Desktop Menu - same as before */}
        <div className="nav-menu desktop">
          {commonLinks.map(link => (
            <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
          ))}

          {/* Farming Advice Dropdown */}
          <div className="dropdown-wrapper" ref={farmingAdviceRef}>
            <button className="dropdown-btn" onClick={() => setShowFarmingAdvice(!showFarmingAdvice)}>
              🌱 शेती सल्ला ▼
            </button>
            {showFarmingAdvice && (
              <div className="dropdown-content">
                {farmingAdviceLinks.map(link => (
                  <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowFarmingAdvice(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AI Assistants Dropdown */}
          <div className="dropdown-wrapper" ref={aiAssistantsRef}>
            <button className="dropdown-btn" onClick={() => setShowAiAssistants(!showAiAssistants)}>
              🤖 AI सहाय्यक ▼
            </button>
            {showAiAssistants && (
              <div className="dropdown-content">
                {aiAssistantsLinks.map(link => (
                  <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowAiAssistants(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Management Dropdown */}
          <div className="dropdown-wrapper" ref={managementRef}>
            <button className="dropdown-btn" onClick={() => setShowManagement(!showManagement)}>
              📊 व्यवस्थापन ▼
            </button>
            {showManagement && (
              <div className="dropdown-content">
                {managementLinks.map(link => (
                  <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowManagement(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Farmer/Buyer/Admin links */}
          {user.role === 'farmer' && (
            <div className="dropdown-wrapper" ref={farmerDropdownRef}>
              <button className="dropdown-btn" onClick={() => setShowFarmerDropdown(!showFarmerDropdown)}>
                🌾 शेतकरी बाजार ▼
              </button>
              {showFarmerDropdown && (
                <div className="dropdown-content">
                  {farmerMarketLinks.map(link => (
                    <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowFarmerDropdown(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {user.role === 'buyer' && (
            <div className="dropdown-wrapper" ref={buyerDropdownRef}>
              <button className="dropdown-btn" onClick={() => setShowBuyerDropdown(!showBuyerDropdown)}>
                🛒 खरेदीदार बाजार ▼
              </button>
              {showBuyerDropdown && (
                <div className="dropdown-content">
                  {buyerMarketLinks.map(link => (
                    <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowBuyerDropdown(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {user.role === 'admin' && (
            <Link to={adminLink.to} className="nav-link">{adminLink.label}</Link>
          )}

          {/* Chat Icon */}
          <Link to="/chat" className="chat-icon-wrapper">
            <button className="chat-btn">
              <FaWhatsapp /> {unreadChatCount > 0 && <span className="badge">{unreadChatCount}</span>}
            </button>
          </Link>

          {/* Notification Bell */}
          <div className="notification-bell-wrapper" ref={notifRef}>
            <button className="bell-btn" onClick={() => setShowNotifications(!showNotifications)}>
              🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <span>📢 सूचना</span>
                  {notifications.length > 0 && <button onClick={markAllAsRead} className="mark-read-btn">सर्व वाचा</button>}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">कोणतीही सूचना नाही</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(notif)}>
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
                        <button className="notif-close" onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}>✖</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="profile-dropdown-wrapper" ref={profileRef}>
            <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="profile" className="profile-avatar-navbar" onError={handleImageError} />
              ) : (
                <span className="profile-icon">👤</span>
              )}
              <span className="profile-name">{user.full_name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/profile" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>👤 माझे प्रोफाइल</Link>
                <button onClick={handleLogout} className="profile-dropdown-item logout-item">🚪 लॉगआउट</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </div>
      </div>

      {/* Mobile Menu – स्क्रोल, क्लोज बटण, नोटिफिकेशन आणि चॅट आयकॉन */}
      {mobileMenuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          {/* Mobile Menu Header with Close button, Chat & Notification Icons */}
          <div className="mobile-menu-header">
            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
            <div className="mobile-header-icons">
              <Link to="/chat" className="mobile-chat-icon" onClick={() => setMobileMenuOpen(false)}>
                <FaWhatsapp /> {unreadChatCount > 0 && <span className="badge">{unreadChatCount}</span>}
              </Link>
              <div className="mobile-notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </div>
            </div>
          </div>

          {/* Mobile Notifications Dropdown (inside menu) */}
          {showNotifications && (
            <div className="mobile-notifications">
              <div className="notifications-header">
                <span>📢 सूचना</span>
                {notifications.length > 0 && <button onClick={markAllAsRead} className="mark-read-btn">सर्व वाचा</button>}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">कोणतीही सूचना नाही</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(notif)}>
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
                      <button className="notif-close" onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}>✖</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Menu Links */}
          {commonLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-section-title">🌱 शेती सल्ला</div>
          {farmingAdviceLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-section-title">🤖 AI सहाय्यक</div>
          {aiAssistantsLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-section-title">📊 व्यवस्थापन</div>
          {managementLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          {user.role === 'farmer' && (
            <>
              <div className="mobile-section-title">🌾 शेतकरी बाजार</div>
              {farmerMarketLinks.map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </>
          )}
          {user.role === 'buyer' && (
            <>
              <div className="mobile-section-title">🛒 खरेदीदार बाजार</div>
              {buyerMarketLinks.map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </>
          )}
          {user.role === 'admin' && (
            <Link to={adminLink.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {adminLink.label}
            </Link>
          )}
          <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>👤 माझे प्रोफाइल</Link>
          <div className="mobile-user-info">
            <span className="mobile-user-name">👋 {user.full_name}</span>
            <button onClick={handleLogout} className="logout-btn">लॉगआउट</button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;