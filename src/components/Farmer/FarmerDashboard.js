

// frontend/src/components/Farmer/FarmerDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../../style/FarmerDashboard.css';

const API = process.env.REACT_APP_API_URL;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const productsRes = await axios.get(`${API}/products/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const products = productsRes.data;

        const ordersRes = await axios.get(`${API}/orders/farmer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = ordersRes.data;

        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({ totalProducts, totalOrders, totalRevenue, avgOrderValue });

        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentOrders(sortedOrders.slice(0, 5));

        const productSales = {};
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const pid = item.product_id;
              const pname = item.product_name;
              const qty = item.quantity;
              if (productSales[pid]) productSales[pid].quantity += qty;
              else productSales[pid] = { name: pname, quantity: qty };
            });
          }
        });
        const top = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        setTopProducts(top);

        const statusCounts = {};
        orders.forEach(order => { statusCounts[order.status] = (statusCounts[order.status] || 0) + 1; });
        setStatusData(statusCounts);
      } catch (err) {
        console.error(err);
        toast.error('डॅशबोर्ड डेटा लोड करताना त्रुटी');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleAddProduct = () => navigate('/farmer/add-products');
  const handleMyProducts = () => navigate('/farmer/my-products');
  const handleOrders = () => navigate('/farmer/orders');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (loading) return <div className="farmer-dashboard loading-state">लोड करत आहे...</div>;

  const barData = {
    labels: topProducts.map(p => p.name),
    datasets: [{
      label: 'विक्री प्रमाण (किलो/नग)',
      data: topProducts.map(p => p.quantity),
      backgroundColor: 'rgba(46,125,50,0.6)',
      borderColor: '#2e7d32',
      borderWidth: 1,
    }],
  };
  const pieData = {
    labels: Object.keys(statusData),
    datasets: [{
      data: Object.values(statusData),
      backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545', '#6c757d'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="farmer-dashboard">
      <div className="dashboard-header">
        <h1>🌾 शेतकरी डॅशबोर्ड</h1>
        <p>नमस्कार, {user?.full_name}! तुमची आकडेवारी पाहा आणि व्यवसाय वाढवा.</p>
      </div>

      <div className="stats-row">
        <div className="farmer-stat-card"><div className="stat-icon">📦</div><div className="stat-info"><h3>{stats.totalProducts}</h3><p>एकूण उत्पादने</p></div></div>
        <div className="farmer-stat-card"><div className="stat-icon">📋</div><div className="stat-info"><h3>{stats.totalOrders}</h3><p>एकूण ऑर्डर</p></div></div>
        <div className="farmer-stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>{formatCurrency(stats.totalRevenue)}</h3><p>एकूण महसूल</p></div></div>
        <div className="farmer-stat-card"><div className="stat-icon">📊</div><div className="stat-info"><h3>{formatCurrency(stats.avgOrderValue)}</h3><p>सरासरी ऑर्डर मूल्य</p></div></div>
      </div>

      <div className="farmer-charts-row">
        <div className="farmer-chart-card"><h3>सर्वाधिक विक्री झालेली उत्पादने</h3>{topProducts.length ? <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} /> : <p>अद्याप विक्री नाही</p>}</div>
        <div className="farmer-chart-card"><h3>ऑर्डर स्थिती विश्लेषण</h3>{Object.keys(statusData).length ? <Pie data={pieData} options={{ responsive: true }} /> : <p>डेटा उपलब्ध नाही</p>}</div>
      </div>

      <div className="recent-orders">
        <h3>अलीकडील ऑर्डर</h3>
        {recentOrders.length === 0 ? <p>अद्याप कोणतीही ऑर्डर नाही.</p> : (
          <table className="orders-table"><thead><tr><th>ऑर्डर #</th><th>तारीख</th><th>एकूण रक्कम</th><th>स्थिती</th><th>पेमेंट</th></tr></thead><tbody>
            {recentOrders.map(order => (
              <tr key={order.id}><td>{order.id}</td><td>{new Date(order.created_at).toLocaleDateString()}</td><td>{formatCurrency(order.total_amount)}</td><td><span className={`status-badge ${order.status}`}>{order.status}</span></td><td>{order.payment_method === 'cod' ? 'रोख' : 'ऑनलाइन'}</td></tr>
            ))}
          </tbody></table>
        )}
        <button className="view-all-btn" onClick={handleOrders}>सर्व ऑर्डर पाहा →</button>
      </div>

      <div className="quick-actions">
        <button className="action-btn add" onClick={handleAddProduct}>➕ नवीन उत्पादन</button>
        <button className="action-btn list" onClick={handleMyProducts}>📋 माझी उत्पादने</button>
        <button className="action-btn orders" onClick={handleOrders}>📦 ऑर्डर व्यवस्थापन</button>
      </div>
    </div>
  );
}

export default FarmerDashboard;