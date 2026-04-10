

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
//   const [showKrushiMitraDropdown, setShowKrushiMitraDropdown] = useState(false);
//   const [profileImageError, setProfileImageError] = useState(false);
//   const menuRef = useRef(null);
//   const notifRef = useRef(null);
//   const profileRef = useRef(null);
//   const krushiMitraRef = useRef(null);

//   // Click outside handler for all dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
//       if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
//       if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
//       if (krushiMitraRef.current && !krushiMitraRef.current.contains(event.target)) setShowKrushiMitraDropdown(false);
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

//   // Common links (Dashboard)
//   const commonLinks = [{ to: '/dashboard', label: '📊 डॅशबोर्ड' }];

//   // Krushi Mitra features (for farmer and also for common? We'll show for all roles, but especially farmer)
//   const krushiMitraLinks = [
//     { to: '/crop-recommendation', label: '🌾 पीक शिफारस' },
//     { to: '/market-prices', label: '📊 मंडी भाव' },
//     { to: '/weather-advice', label: '🌤️ हवामान सल्ला' },
//     { to: '/chatbot', label: '🤖 शेती सहाय्यक' },
//     { to: '/disease-detection', label: '🌿 रोग ओळख' },
//   ];

//   // Farmer specific links
//   const farmerSpecificLinks = [
//     { to: '/farmer/add-products', label: '🌾 उत्पादन जोडा' },
//     { to: '/farmer/my-products', label: '📦 माझी उत्पादने' },
//     { to: '/farmer/orders', label: '📋 माझ्या ऑर्डर' },
//   ];

//   const buyerLinks = [
//     { to: '/buyer/products', label: '🛒 उत्पादने बघा' },
//     { to: '/buyer/orders', label: '📋 माझे ऑर्डर' },
//     { to: '/buyer/cart', label: '🛍️ कार्ट' },
//   ];

//   const adminLinks = [{ to: '/admin/dashboard', label: '🔧 Admin पॅनल' }];

//   let roleSpecificLinks = [];
//   if (user.role === 'farmer') roleSpecificLinks = farmerSpecificLinks;
//   else if (user.role === 'buyer') roleSpecificLinks = buyerLinks;
//   else if (user.role === 'admin') roleSpecificLinks = adminLinks;

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

//           {/* Krushi Mitra Dropdown */}
//           <div className="dropdown-wrapper" ref={krushiMitraRef}>
//             <button
//               className="dropdown-btn"
//               onClick={() => setShowKrushiMitraDropdown(!showKrushiMitraDropdown)}
//             >
//               🌱 कृषि मित्र ▼
//             </button>
//             {showKrushiMitraDropdown && (
//               <div className="dropdown-content">
//                 {krushiMitraLinks.map(link => (
//                   <Link
//                     key={link.to}
//                     to={link.to}
//                     className="dropdown-item"
//                     onClick={() => setShowKrushiMitraDropdown(false)}
//                   >
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Role specific links (Farmer/Buyer/Admin) */}
//           {roleSpecificLinks.map(link => (
//             <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
//           ))}

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
//                   {notifications.length > 0 && (
//                     <button onClick={markAllAsRead} className="mark-read-btn">सर्व वाचा</button>
//                   )}
//                 </div>
//                 <div className="notifications-list">
//                   {notifications.length === 0 ? (
//                     <div className="no-notifications">कोणतीही सूचना नाही</div>
//                   ) : (
//                     notifications.map(notif => (
//                       <div
//                         key={notif.id}
//                         className={`notification-item ${notif.read ? 'read' : 'unread'}`}
//                         onClick={() => handleNotificationClick(notif)}
//                       >
//                         <div className="notif-title">{notif.title}</div>
//                         <div className="notif-message">{notif.message}</div>
//                         <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
//                         <button
//                           className="notif-close"
//                           onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
//                         >✖</button>
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

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="mobile-menu" ref={menuRef}>
//           {commonLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
//           {/* Krushi Mitra section heading */}
//           <div className="mobile-section-title">🌱 कृषि मित्र</div>
//           {krushiMitraLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
//           {/* Role specific links */}
//           <div className="mobile-section-title">
//             {user.role === 'farmer' ? '👨‍🌾 शेतकरी सेवा' : user.role === 'buyer' ? '🛒 खरेदीदार सेवा' : '🔧 प्रशासन'}
//           </div>
//           {roleSpecificLinks.map(link => (
//             <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
//               {link.label}
//             </Link>
//           ))}
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
  const [showKrushiMitraDropdown, setShowKrushiMitraDropdown] = useState(false);
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const krushiMitraRef = useRef(null);
  const farmerDropdownRef = useRef(null);
  const buyerDropdownRef = useRef(null);

  // Click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (krushiMitraRef.current && !krushiMitraRef.current.contains(event.target)) setShowKrushiMitraDropdown(false);
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

  // Common links (Dashboard)
  const commonLinks = [{ to: '/dashboard', label: '📊 डॅशबोर्ड' }];

  // Krushi Mitra features (for all roles)
  const krushiMitraLinks = [
    { to: '/crop-recommendation', label: '🌾 पीक शिफारस' },
    { to: '/market-prices', label: '📊 मंडी भाव' },
    { to: '/weather-advice', label: '🌤️ हवामान सल्ला' },
    { to: '/chatbot', label: '🤖 शेती सहाय्यक' },
    { to: '/disease-detection', label: '🌿 रोग ओळख' },
  ];

  // Farmer marketplace links
  const farmerMarketLinks = [
    { to: '/farmer/add-products', label: '🌾 उत्पादन जोडा' },
    { to: '/farmer/my-products', label: '📦 माझी उत्पादने' },
    { to: '/farmer/orders', label: '📋 माझ्या ऑर्डर' },
  ];

  // Buyer marketplace links
  const buyerMarketLinks = [
    { to: '/buyer/products', label: '🛒 उत्पादने बघा' },
    { to: '/buyer/orders', label: '📋 माझे ऑर्डर' },
    { to: '/buyer/cart', label: '🛍️ कार्ट' },
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

        {/* Desktop Menu */}
        <div className="nav-menu desktop">
          {commonLinks.map(link => (
            <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
          ))}

          {/* Krushi Mitra Dropdown */}
          <div className="dropdown-wrapper" ref={krushiMitraRef}>
            <button className="dropdown-btn" onClick={() => setShowKrushiMitraDropdown(!showKrushiMitraDropdown)}>
              🌱 कृषि मित्र ▼
            </button>
            {showKrushiMitraDropdown && (
              <div className="dropdown-content">
                {krushiMitraLinks.map(link => (
                  <Link key={link.to} to={link.to} className="dropdown-item" onClick={() => setShowKrushiMitraDropdown(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Role-specific marketplace dropdowns */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          {commonLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mobile-section-title">🌱 कृषि मित्र</div>
          {krushiMitraLinks.map(link => (
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
          <Link to="/chat" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>💬 संदेश</Link>
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