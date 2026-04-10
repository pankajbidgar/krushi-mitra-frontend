// import React, { useEffect, useState ,useCallback} from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';
// import '../style/AdminDashboard.css';

// ChartJS.register(ArcElement, Tooltip, Legend);

// function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [activeTab, setActiveTab] = useState('stats');
//   const token = localStorage.getItem('token');

//   // Fetch Statistics
//   // const fetchStats = async () => {
//   //   try {
//   //     const res = await axios.get('http://localhost:8000/admin/stats', {
//   //       headers: { Authorization: `Bearer ${token}` }
//   //     });
//   //     setStats(res.data);
//   //   } catch (err) {
//   //     console.error('Stats fetch failed', err);
//   //   }
//   // };

//   const fetchStats = useCallback(async () => {
//   try {
//     const res = await axios.get('http://localhost:8000/admin/stats', {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setStats(res.data);
//   } catch (err) {
//     console.error('Stats fetch failed', err);
//   }
// }, [token]);


//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/admin/users', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUsers(res.data);
//     } catch (err) {
//       toast.error('Users fetch failed');
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/admin/products', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setProducts(res.data);
//     } catch (err) {
//       toast.error('Products fetch failed');
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/admin/orders', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setOrders(res.data);
//     } catch (err) {
//       toast.error('Orders fetch failed');
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//     if (activeTab === 'users') fetchUsers();
//     if (activeTab === 'products') fetchProducts();
//     if (activeTab === 'orders') fetchOrders();
//   }, [activeTab,fetchStats, fetchUsers, fetchProducts, fetchOrders]);

//   const deleteUser = async (id) => {
//     if (window.confirm('Delete this user?')) {
//       try {
//         await axios.delete(`http://localhost:8000/admin/users/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('User deleted');
//         fetchUsers();
//         fetchStats();
//       } catch (err) {
//         toast.error('Delete failed');
//       }
//     }
//   };

//   const deleteProduct = async (id) => {
//     if (window.confirm('Delete this product?')) {
//       try {
//         await axios.delete(`http://localhost:8000/admin/products/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Product deleted');
//         fetchProducts();
//         fetchStats();
//       } catch (err) {
//         toast.error('Delete failed');
//       }
//     }
//   };

//   const updateOrderStatus = async (id, newStatus) => {
//     try {
//       await axios.patch(`http://localhost:8000/admin/orders/${id}/status?status=${newStatus}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('Order status updated');
//       fetchOrders();
//       fetchStats();
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   const updateUserRole = async (id, newRole) => {
//     try {
//       await axios.patch(`http://localhost:8000/admin/users/${id}/role?new_role=${newRole}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('User role updated');
//       fetchUsers();
//       fetchStats();
//     } catch (err) {
//       toast.error('Role update failed');
//     }
//   };

//   // Pie chart data for order statuses
//   const pieData = stats && stats.order_statuses ? {
//     labels: Object.keys(stats.order_statuses),
//     datasets: [{
//       data: Object.values(stats.order_statuses),
//       backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545', '#6c757d'],
//       borderWidth: 0
//     }]
//   } : null;

//   return (
//     <div className="admin-container">
//       <h2>🔧 प्रशासक डॅशबोर्ड</h2>
//       <div className="admin-tabs">
//         <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>📊 आकडेवारी</button>
//         <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 वापरकर्ते</button>
//         <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>📦 उत्पादने</button>
//         <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📋 ऑर्डर</button>
//       </div>

//       {activeTab === 'stats' && (
//         <div>
//           {stats ? (
//             <>
//               <div className="stats-cards">
//                 <div className="stat-card">👥 एकूण वापरकर्ते: {stats.total_users}</div>
//                 <div className="stat-card">📦 एकूण उत्पादने: {stats.total_products}</div>
//                 <div className="stat-card">📋 एकूण ऑर्डर: {stats.total_orders}</div>
//                 <div className="stat-card">💰 महिन्याचे उत्पन्न: ₹{stats.monthly_income}</div>
//               </div>
//               {pieData && (
//                 <div className="chart-container">
//                   <h3>ऑर्डर स्थिती वितरण</h3>
//                   <Pie data={pieData} />
//                 </div>
//               )}
//             </>
//           ) : (
//             <p>आकडेवारी लोड करत आहे...</p>
//           )}
//         </div>
//       )}

//       {activeTab === 'users' && (
//         <div className="admin-table-wrapper">
//           <table className="admin-table">
//             <thead>
//               <tr><th>ID</th><th>नाव</th><th>ईमेल</th><th>प्रकार</th><th>प्रकार बदला</th><th>कृती</th></tr>
//             </thead>
//             <tbody>
//               {users.map(u => (
//                 <tr key={u.id}>
//                   <td>{u.id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.role}</td>
//                   <td>
//                     <select defaultValue={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}>
//                       <option value="farmer">शेतकरी</option>
//                       <option value="buyer">खरेदीदार</option>
//                       <option value="admin">प्रशासक</option>
//                     </select>
//                    </td>
//                   <td><button onClick={() => deleteUser(u.id)} className="delete-btn">हटवा</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'products' && (
//         <div className="admin-table-wrapper">
//           <table className="admin-table">
//             <thead>
//               <tr><th>ID</th><th>नाव</th><th>किंमत</th><th>शेतकरी</th><th>उपलब्धता</th><th>कृती</th></tr>
//             </thead>
//             <tbody>
//               {products.map(p => (
//                 <tr key={p.id}>
//                   <td>{p.id}</td><td>{p.name}</td><td>₹{p.price}</td><td>{p.farmer_name}</td>
//                   <td>{p.is_available ? 'होय' : 'नाही'}</td>
//                   <td><button onClick={() => deleteProduct(p.id)} className="delete-btn">हटवा</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'orders' && (
//         <div className="admin-table-wrapper">
//           <table className="admin-table">
//             <thead>
//               <tr><th>ID</th><th>एकूण</th><th>स्थिती</th><th>पेमेंट</th><th>कृती</th></tr>
//             </thead>
//             <tbody>
//               {orders.map(o => (
//                 <tr key={o.id}>
//                   <td>{o.id}</td><td>₹{o.total_amount}</td>
//                   <td><span className={`status-badge ${o.status}`}>
//                     {o.status === 'pending' ? 'प्रलंबित' : 
//                      o.status === 'confirmed' ? 'कन्फर्म' :
//                      o.status === 'shipped' ? 'पाठवले' :
//                      o.status === 'delivered' ? 'डिलिव्हर' : 'रद्द'}
//                   </span></td>
//                   <td>{o.payment_method === 'cod' ? 'रोख' : o.payment_method === 'online_full' ? 'ऑनलाइन पूर्ण' : 'ऑनलाइन अॅडव्हान्स'}</td>
//                   <td>
//                     <select onChange={(e) => updateOrderStatus(o.id, e.target.value)} value={o.status}>
//                       <option value="pending">प्रलंबित</option>
//                       <option value="confirmed">कन्फर्म</option>
//                       <option value="shipped">पाठवले</option>
//                       <option value="delivered">डिलिव्हर</option>
//                       <option value="cancelled">रद्द</option>
//                     </select>
//                    </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminDashboard;


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import '../style/AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const token = localStorage.getItem('token');

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Users fetch failed');
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Products fetch failed');
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      toast.error('Orders fetch failed');
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchStats, fetchUsers, fetchProducts, fetchOrders]);

  const deleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await axios.delete(`http://localhost:8000/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User deleted');
        fetchUsers();
        fetchStats();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`http://localhost:8000/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted');
        fetchProducts();
        fetchStats();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/admin/orders/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated');
      fetchOrders();
      fetchStats();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const updateUserRole = async (id, newRole) => {
    try {
      await axios.patch(`http://localhost:8000/admin/users/${id}/role?new_role=${newRole}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User role updated');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const pieData = stats && stats.order_statuses ? {
    labels: Object.keys(stats.order_statuses),
    datasets: [{
      data: Object.values(stats.order_statuses),
      backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545', '#6c757d'],
      borderWidth: 0
    }]
  } : null;

  return (
    <div className="admin-container">
      <h2>🔧 प्रशासक डॅशबोर्ड</h2>
      <div className="admin-tabs">
        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>📊 आकडेवारी</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 वापरकर्ते</button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>📦 उत्पादने</button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📋 ऑर्डर</button>
      </div>

      {activeTab === 'stats' && (
        <div>
          {stats ? (
            <>
              <div className="stats-cards">
                <div className="stat-card">👥 एकूण वापरकर्ते: {stats.total_users}</div>
                <div className="stat-card">📦 एकूण उत्पादने: {stats.total_products}</div>
                <div className="stat-card">📋 एकूण ऑर्डर: {stats.total_orders}</div>
                <div className="stat-card">💰 महिन्याचे उत्पन्न: ₹{stats.monthly_income}</div>
              </div>
              {pieData && (
                <div className="chart-container">
                  <h3>ऑर्डर स्थिती वितरण</h3>
                  <Pie data={pieData} />
                </div>
              )}
            </>
          ) : (
            <p>आकडेवारी लोड करत आहे...</p>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>नाव</th><th>ईमेल</th><th>प्रकार</th><th>प्रकार बदला</th><th>कृती</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <select defaultValue={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}>
                      <option value="farmer">शेतकरी</option>
                      <option value="buyer">खरेदीदार</option>
                      <option value="admin">प्रशासक</option>
                    </select>
                    </td>
                  <td><button onClick={() => deleteUser(u.id)} className="delete-btn">हटवा</button></td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>नाव</th><th>किंमत</th><th>शेतकरी</th><th>उपलब्धता</th><th>कृती</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.farmer_name}</td>
                  <td>{p.is_available ? 'होय' : 'नाही'}</td>
                  <td><button onClick={() => deleteProduct(p.id)} className="delete-btn">हटवा</button></td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>एकूण</th><th>स्थिती</th><th>पेमेंट</th><th>कृती</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>₹{o.total_amount}</td>
                  <td><span className={`status-badge ${o.status}`}>
                    {o.status === 'pending' ? 'प्रलंबित' : 
                     o.status === 'confirmed' ? 'कन्फर्म' :
                     o.status === 'shipped' ? 'पाठवले' :
                     o.status === 'delivered' ? 'डिलिव्हर' : 'रद्द'}
                  </span></td>
                  <td>{o.payment_method === 'cod' ? 'रोख' : o.payment_method === 'online_full' ? 'ऑनलाइन पूर्ण' : 'ऑनलाइन अॅडव्हान्स'}</td>
                  <td>
                    <select onChange={(e) => updateOrderStatus(o.id, e.target.value)} value={o.status}>
                      <option value="pending">प्रलंबित</option>
                      <option value="confirmed">कन्फर्म</option>
                      <option value="shipped">पाठवले</option>
                      <option value="delivered">डिलिव्हर</option>
                      <option value="cancelled">रद्द</option>
                    </select>
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;