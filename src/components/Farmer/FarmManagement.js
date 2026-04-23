

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import '../../style/FarmManagement.css';

// function FarmManagement() {
//   const token = localStorage.getItem('token');
//   const [expenses, setExpenses] = useState([]);
//   const [profitLoss, setProfitLoss] = useState(null);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // New expense form state
//   const [newExpense, setNewExpense] = useState({
//     land_name: '',
//     crop_name: '',
//     category: 'seeds',
//     description: '',
//     quantity: '',
//     unit: 'kg',
//     amount: '',
//     payment_method: 'cash',
//     date: new Date().toISOString().split('T')[0],
//     is_recurring: false,
//     recurring_interval: '',
//     payment_status: 'paid'
//   });
//   const [receiptFile, setReceiptFile] = useState(null);
//   const [receiptPreview, setReceiptPreview] = useState(null);
//   const receiptCameraRef = useRef(null);
//   const receiptGalleryRef = useRef(null);

//   // Fetch data
//   const fetchData = async () => {
//     try {
//       const [expRes, plRes] = await Promise.all([
//         axios.get('http://localhost:8000/farm/expenses', {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { start_date: startDate, end_date: endDate }
//         }),
//         axios.get('http://localhost:8000/farm/profit-loss', {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { start_date: startDate, end_date: endDate }
//         })
//       ]);
//       setExpenses(expRes.data);
//       setProfitLoss(plRes.data);
//     } catch (err) {
//       toast.error('डेटा मिळवताना त्रुटी');
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [startDate, endDate]);

//   // Upload receipt image
//   const uploadReceipt = async () => {
//     if (!receiptFile) return null;
//     const formData = new FormData();
//     formData.append('files', receiptFile);
//     try {
//       const res = await axios.post('http://localhost:8000/upload-multiple/', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       return res.data.image_urls[0];
//     } catch (err) {
//       toast.error('रसीद अपलोड अयशस्वी');
//       return null;
//     }
//   };

//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
//       toast.error('कृपया योग्य रक्कम भरा');
//       return;
//     }
//     setSubmitting(true);
//     let receiptUrl = null;
//     if (receiptFile) {
//       receiptUrl = await uploadReceipt();
//       if (!receiptUrl) {
//         setSubmitting(false);
//         return;
//       }
//     }
//     const expenseData = {
//       ...newExpense,
//       amount: parseFloat(newExpense.amount),
//       quantity: newExpense.quantity ? parseFloat(newExpense.quantity) : null,
//       receipt_url: receiptUrl,
//       payment_status: newExpense.payment_status
//     };
//     try {
//       await axios.post('http://localhost:8000/farm/expenses', expenseData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('खर्च जोडला');
//       // Reset form
//       setNewExpense({
//         land_name: '',
//         crop_name: '',
//         category: 'seeds',
//         description: '',
//         quantity: '',
//         unit: 'kg',
//         amount: '',
//         payment_method: 'cash',
//         date: new Date().toISOString().split('T')[0],
//         is_recurring: false,
//         recurring_interval: '',
//         payment_status: 'paid'
//       });
//       setReceiptFile(null);
//       setReceiptPreview(null);
//       fetchData();
//     } catch (err) {
//       toast.error('खर्च जोडताना त्रुटी');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const deleteExpense = async (id) => {
//     if (window.confirm('हा खर्च हटवायचा?')) {
//       try {
//         await axios.delete(`http://localhost:8000/farm/expenses/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('खर्च हटवला');
//         fetchData();
//       } catch (err) {
//         toast.error('हटवताना त्रुटी');
//       }
//     }
//   };

//   // Handlers for receipt image
//   const handleReceiptCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setReceiptFile(file);
//       setReceiptPreview(URL.createObjectURL(file));
//     }
//     e.target.value = '';
//   };
//   const openReceiptCamera = () => receiptCameraRef.current.click();
//   const openReceiptGallery = () => receiptGalleryRef.current.click();

//   // Helper to format currency
//   const formatCurrency = (amount) => `₹${amount?.toFixed(2) || '0.00'}`;

//   return (
//     <div className="farm-management-container">
//       <div className="farm-header">
//         <h2>🌾 शेत व्यवस्थापन</h2>
//       </div>

//       {/* Date Filter */}
//       <div className="date-filter">
//         <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
//         <span>ते</span>
//         <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
//         <button onClick={() => { setStartDate(''); setEndDate(''); }}>रीसेट</button>
//       </div>

//       {/* Profit/Loss Cards */}
//       {profitLoss && (
//         <>
//           <div className="pl-cards">
//             <div className="pl-card revenue">
//               <div>💰 एकूण उत्पन्न</div>
//               <h3>{formatCurrency(profitLoss.total_revenue)}</h3>
//             </div>
//             <div className="pl-card expense">
//               <div>💸 एकूण खर्च</div>
//               <h3>{formatCurrency(profitLoss.total_expenses)}</h3>
//             </div>
//             <div className={`pl-card profit ${profitLoss.profit >= 0 ? 'positive' : 'negative'}`}>
//               <div>📊 नफा / तोटा</div>
//               <h3>{formatCurrency(profitLoss.profit)}</h3>
//             </div>
//           </div>

//           {/* Breakdowns */}
//           <div className="breakdowns">
//             {Object.keys(profitLoss.expense_breakdown).length > 0 && (
//               <div className="breakdown-card">
//                 <h4>📂 प्रकारानुसार खर्च</h4>
//                 <ul>
//                   {Object.entries(profitLoss.expense_breakdown).map(([cat, amt]) => (
//                     <li key={cat}><span>{cat === 'seeds' ? 'बियाणे' : cat === 'fertilizer' ? 'खते' : cat === 'labor' ? 'मजुरी' : cat === 'equipment' ? 'साहित्य' : 'इतर'}</span><span>{formatCurrency(amt)}</span></li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {Object.keys(profitLoss.land_breakdown).length > 0 && (
//               <div className="breakdown-card">
//                 <h4>🚜 शेतानुसार खर्च</h4>
//                 <ul>
//                   {Object.entries(profitLoss.land_breakdown).map(([land, amt]) => (
//                     <li key={land}><span>{land}</span><span>{formatCurrency(amt)}</span></li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {Object.keys(profitLoss.crop_breakdown).length > 0 && (
//               <div className="breakdown-card">
//                 <h4>🌽 पिकानुसार खर्च</h4>
//                 <ul>
//                   {Object.entries(profitLoss.crop_breakdown).map(([crop, amt]) => (
//                     <li key={crop}><span>{crop}</span><span>{formatCurrency(amt)}</span></li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Add Expense Form */}
//       <div className="add-expense-card">
//         <h3>➕ नवीन खर्च नोंदवा</h3>
//         <form onSubmit={handleAddExpense}>
//           <div className="form-grid">
//             <div className="form-group">
//               <label>शेताचे नाव</label>
//               <input type="text" value={newExpense.land_name} onChange={e => setNewExpense({...newExpense, land_name: e.target.value})} placeholder="उदा. पूर्वेकडील शेत" />
//             </div>
//             <div className="form-group">
//               <label>पीक</label>
//               <input type="text" value={newExpense.crop_name} onChange={e => setNewExpense({...newExpense, crop_name: e.target.value})} placeholder="उदा. टोमॅटो" />
//             </div>
//             <div className="form-group">
//               <label>प्रकार</label>
//               <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
//                 <option value="seeds">बियाणे</option>
//                 <option value="fertilizer">खते</option>
//                 <option value="labor">मजुरी</option>
//                 <option value="equipment">साहित्य</option>
//                 <option value="other">इतर</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>तपशील</label>
//               <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="अधिक माहिती" />
//             </div>
//             <div className="form-group">
//               <label>प्रमाण</label>
//               <input type="number" step="0.01" value={newExpense.quantity} onChange={e => setNewExpense({...newExpense, quantity: e.target.value})} placeholder="संख्या" />
//             </div>
//             <div className="form-group">
//               <label>युनिट</label>
//               <select value={newExpense.unit} onChange={e => setNewExpense({...newExpense, unit: e.target.value})}>
//                 <option value="kg">kg</option>
//                 <option value="liter">liter</option>
//                 <option value="piece">piece</option>
//                 <option value="bag">bag</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>रक्कम (₹) *</label>
//               <input type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
//             </div>
//             <div className="form-group">
//               <label>पेमेंट पद्धत</label>
//               <select value={newExpense.payment_method} onChange={e => setNewExpense({...newExpense, payment_method: e.target.value})}>
//                 <option value="cash">रोख</option>
//                 <option value="bank">बँक</option>
//                 <option value="credit">उधार</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>पेमेंट स्थिती</label>
//               <select value={newExpense.payment_status} onChange={e => setNewExpense({...newExpense, payment_status: e.target.value})}>
//                 <option value="paid">✅ पूर्ण पैसे दिले</option>
//                 <option value="pending">⏳ पैसे थकबाकी</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>तारीख</label>
//               <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} required />
//             </div>
//             <div className="form-group checkbox-group">
//               <label>
//                 <input type="checkbox" checked={newExpense.is_recurring} onChange={e => setNewExpense({...newExpense, is_recurring: e.target.checked})} />
//                 आवर्ती खर्च
//               </label>
//               {newExpense.is_recurring && (
//                 <select value={newExpense.recurring_interval} onChange={e => setNewExpense({...newExpense, recurring_interval: e.target.value})}>
//                   <option value="monthly">मासिक</option>
//                   <option value="yearly">वार्षिक</option>
//                 </select>
//               )}
//             </div>
//             <div className="form-group">
//               <label>बिलाचा फोटो</label>
//               <div className="image-upload-buttons">
//                 <button type="button" className="gallery-btn" onClick={openReceiptGallery}>🖼️ गॅलरी</button>
//                 <button type="button" className="camera-btn" onClick={openReceiptCamera}>📷 कॅमेरा</button>
//               </div>
//               <input ref={receiptGalleryRef} type="file" accept="image/*" onChange={handleReceiptCapture} style={{display:'none'}} />
//               <input ref={receiptCameraRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptCapture} style={{display:'none'}} />
//               {receiptPreview && <img src={receiptPreview} alt="receipt preview" className="receipt-preview" />}
//             </div>
//           </div>
//           <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'जोडत आहे...' : 'खर्च जोडा'}</button>
//         </form>
//       </div>

//       {/* Expenses List */}
//       <div className="expenses-list">
//         <h3>📋 खर्च यादी</h3>
//         {expenses.length === 0 ? (
//           <p>अद्याप कोणताही खर्च नोंदवलेला नाही.</p>
//         ) : (
//           <div style={{ overflowX: 'auto' }}>
//             <table className="expenses-table">
//               <thead>
//                 <tr>
//                   <th>तारीख</th>
//                   <th>शेत</th>
//                   <th>पीक</th>
//                   <th>प्रकार</th>
//                   <th>तपशील</th>
//                   <th>प्रमाण</th>
//                   <th>रक्कम</th>
//                   <th>पेमेंट</th>
//                   <th>स्थिती</th>
//                   <th>बिल</th>
//                   <th>कृती</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {expenses.map(exp => (
//                   <tr key={exp.id}>
//                     <td>{exp.date}</td>
//                     <td>{exp.land_name || '—'}</td>
//                     <td>{exp.crop_name || '—'}</td>
//                     <td>{exp.category === 'seeds' ? 'बियाणे' : exp.category === 'fertilizer' ? 'खते' : exp.category === 'labor' ? 'मजुरी' : exp.category === 'equipment' ? 'साहित्य' : 'इतर'}</td>
//                     <td>{exp.description || '—'}</td>
//                     <td>{exp.quantity ? `${exp.quantity} ${exp.unit}` : '—'}</td>
//                     <td>₹{exp.amount.toFixed(2)}</td>
//                     <td>{exp.payment_method === 'cash' ? 'रोख' : exp.payment_method === 'bank' ? 'बँक' : 'उधार'}</td>
//                     <td className={exp.payment_status === 'paid' ? 'paid-badge' : 'pending-badge'}>
//                       {exp.payment_status === 'paid' ? '✅ दिले' : '⏳ थकबाकी'}
//                     </td>
//                     <td>
//                       {exp.receipt_url && (
//                         <a href={`http://localhost:8000${exp.receipt_url}`} target="_blank" rel="noopener noreferrer">📄 बिल</a>
//                       )}
//                     </td>
//                     <td><button className="delete-expense-btn" onClick={() => deleteExpense(exp.id)}>हटवा</button></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default FarmManagement;





import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/FarmManagement.css';
const API = process.env.REACT_APP_API_URL;

function FarmManagement() {
  const token = localStorage.getItem('token');
  const [expenses, setExpenses] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal visibility

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    land_name: '',
    crop_name: '',
    category: 'seeds',
    description: '',
    quantity: '',
    unit: 'kg',
    amount: '',
    payment_method: 'cash',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_interval: '',
    payment_status: 'paid'
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const receiptCameraRef = useRef(null);
  const receiptGalleryRef = useRef(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [expRes, plRes] = await Promise.all([
        axios.get(`${API}/farm/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: startDate, end_date: endDate }
        }),
        axios.get(`${API}/farm/profit-loss`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: startDate, end_date: endDate }
        })
      ]);
      setExpenses(expRes.data);
      setProfitLoss(plRes.data);
    } catch (err) {
      toast.error('डेटा मिळवताना त्रुटी');
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Upload receipt image
  const uploadReceipt = async () => {
    if (!receiptFile) return null;
    const formData = new FormData();
    formData.append('files', receiptFile);
    try {
      const res = await axios.post(`${API}/upload-multiple/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.image_urls[0];
    } catch (err) {
      toast.error('रसीद अपलोड अयशस्वी');
      return null;
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error('कृपया योग्य रक्कम भरा');
      return;
    }
    setSubmitting(true);
    let receiptUrl = null;
    if (receiptFile) {
      receiptUrl = await uploadReceipt();
      if (!receiptUrl) {
        setSubmitting(false);
        return;
      }
    }
    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      quantity: newExpense.quantity ? parseFloat(newExpense.quantity) : null,
      receipt_url: receiptUrl,
      payment_status: newExpense.payment_status
    };
    try {
      await axios.post(`${API}/farm/expenses`, expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('खर्च जोडला');
      // Reset form
      setNewExpense({
        land_name: '',
        crop_name: '',
        category: 'seeds',
        description: '',
        quantity: '',
        unit: 'kg',
        amount: '',
        payment_method: 'cash',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_interval: '',
        payment_status: 'paid'
      });
      setReceiptFile(null);
      setReceiptPreview(null);
      setShowModal(false); // Close modal after adding
      fetchData();
    } catch (err) {
      toast.error('खर्च जोडताना त्रुटी');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm('हा खर्च हटवायचा?')) {
      try {
        await axios.delete(`${API}/farm/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('खर्च हटवला');
        fetchData();
      } catch (err) {
        toast.error('हटवताना त्रुटी');
      }
    }
  };

  // Handlers for receipt image
  const handleReceiptCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };
  const openReceiptCamera = () => receiptCameraRef.current.click();
  const openReceiptGallery = () => receiptGalleryRef.current.click();

  const formatCurrency = (amount) => `₹${amount?.toFixed(2) || '0.00'}`;

  return (
    <div className="farm-management-container">
      <div className="farm-header">
        <h2>🌾 शेत व्यवस्थापन</h2>
        <button className="add-expense-main-btn" onClick={() => setShowModal(true)}>
          ➕ नवीन खर्च जोडा
        </button>
      </div>

      {/* Date Filter */}
      <div className="date-filter">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <span>ते</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button onClick={() => { setStartDate(''); setEndDate(''); }}>रीसेट</button>
      </div>

      {/* Profit/Loss Cards */}
      {profitLoss && (
        <>
          <div className="pl-cards">
            <div className="pl-card revenue">
              <div>💰 एकूण उत्पन्न</div>
              <h3>{formatCurrency(profitLoss.total_revenue)}</h3>
            </div>
            <div className="pl-card expense">
              <div>💸 एकूण खर्च</div>
              <h3>{formatCurrency(profitLoss.total_expenses)}</h3>
            </div>
            <div className={`pl-card profit ${profitLoss.profit >= 0 ? 'positive' : 'negative'}`}>
              <div>📊 नफा / तोटा</div>
              <h3>{formatCurrency(profitLoss.profit)}</h3>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="breakdowns">
            {Object.keys(profitLoss.expense_breakdown).length > 0 && (
              <div className="breakdown-card">
                <h4>📂 प्रकारानुसार खर्च</h4>
                <ul>
                  {Object.entries(profitLoss.expense_breakdown).map(([cat, amt]) => (
                    <li key={cat}><span>{cat === 'seeds' ? 'बियाणे' : cat === 'fertilizer' ? 'खते' : cat === 'labor' ? 'मजुरी' : cat === 'equipment' ? 'साहित्य' : 'इतर'}</span><span>{formatCurrency(amt)}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(profitLoss.land_breakdown).length > 0 && (
              <div className="breakdown-card">
                <h4>🚜 शेतानुसार खर्च</h4>
                <ul>
                  {Object.entries(profitLoss.land_breakdown).map(([land, amt]) => (
                    <li key={land}><span>{land}</span><span>{formatCurrency(amt)}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(profitLoss.crop_breakdown).length > 0 && (
              <div className="breakdown-card">
                <h4>🌽 पिकानुसार खर्च</h4>
                <ul>
                  {Object.entries(profitLoss.crop_breakdown).map(([crop, amt]) => (
                    <li key={crop}><span>{crop}</span><span>{formatCurrency(amt)}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Expenses List */}
      <div className="expenses-list">
        <h3>📋 खर्च यादी</h3>
        {expenses.length === 0 ? (
          <p>अद्याप कोणताही खर्च नोंदवलेला नाही.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>तारीख</th>
                  <th>शेत</th>
                  <th>पीक</th>
                  <th>प्रकार</th>
                  <th>तपशील</th>
                  <th>प्रमाण</th>
                  <th>रक्कम</th>
                  <th>पेमेंट</th>
                  <th>स्थिती</th>
                  <th>बिल</th>
                  <th>कृती</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>{exp.land_name || '—'}</td>
                    <td>{exp.crop_name || '—'}</td>
                    <td>{exp.category === 'seeds' ? 'बियाणे' : exp.category === 'fertilizer' ? 'खते' : exp.category === 'labor' ? 'मजुरी' : exp.category === 'equipment' ? 'साहित्य' : 'इतर'}</td>
                    <td>{exp.description || '—'}</td>
                    <td>{exp.quantity ? `${exp.quantity} ${exp.unit}` : '—'}</td>
                    <td>₹{exp.amount.toFixed(2)}</td>
                    <td>{exp.payment_method === 'cash' ? 'रोख' : exp.payment_method === 'bank' ? 'बँक' : 'उधार'}</td>
                    <td className={exp.payment_status === 'paid' ? 'paid-badge' : 'pending-badge'}>
                      {exp.payment_status === 'paid' ? '✅ दिले' : '⏳ थकबाकी'}
                    </td>
                    <td>
                      {exp.receipt_url && (
                        <a href={`${API}${exp.receipt_url}`} target="_blank" rel="noopener noreferrer">📄 बिल</a>
                      )}
                    </td>
                    <td><button className="delete-expense-btn" onClick={() => deleteExpense(exp.id)}>हटवा</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add Expense */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ नवीन खर्च नोंदवा</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="form-grid">
                <div className="form-group">
                  <label>शेताचे नाव</label>
                  <input type="text" value={newExpense.land_name} onChange={e => setNewExpense({...newExpense, land_name: e.target.value})} placeholder="उदा. पूर्वेकडील शेत" />
                </div>
                <div className="form-group">
                  <label>पीक</label>
                  <input type="text" value={newExpense.crop_name} onChange={e => setNewExpense({...newExpense, crop_name: e.target.value})} placeholder="उदा. टोमॅटो" />
                </div>
                <div className="form-group">
                  <label>प्रकार</label>
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                    <option value="seeds">बियाणे</option>
                    <option value="fertilizer">खते</option>
                    <option value="labor">मजुरी</option>
                    <option value="equipment">साहित्य</option>
                    <option value="other">इतर</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>तपशील</label>
                  <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="अधिक माहिती" />
                </div>
                <div className="form-group">
                  <label>प्रमाण</label>
                  <input type="number" step="0.01" value={newExpense.quantity} onChange={e => setNewExpense({...newExpense, quantity: e.target.value})} placeholder="संख्या" />
                </div>
                <div className="form-group">
                  <label>युनिट</label>
                  <select value={newExpense.unit} onChange={e => setNewExpense({...newExpense, unit: e.target.value})}>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="piece">piece</option>
                    <option value="bag">bag</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>रक्कम (₹) *</label>
                  <input type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>पेमेंट पद्धत</label>
                  <select value={newExpense.payment_method} onChange={e => setNewExpense({...newExpense, payment_method: e.target.value})}>
                    <option value="cash">रोख</option>
                    <option value="bank">बँक</option>
                    <option value="credit">उधार</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>पेमेंट स्थिती</label>
                  <select value={newExpense.payment_status} onChange={e => setNewExpense({...newExpense, payment_status: e.target.value})}>
                    <option value="paid">✅ पूर्ण पैसे दिले</option>
                    <option value="pending">⏳ पैसे थकबाकी</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>तारीख</label>
                  <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} required />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={newExpense.is_recurring} onChange={e => setNewExpense({...newExpense, is_recurring: e.target.checked})} />
                    आवर्ती खर्च
                  </label>
                  {newExpense.is_recurring && (
                    <select value={newExpense.recurring_interval} onChange={e => setNewExpense({...newExpense, recurring_interval: e.target.value})}>
                      <option value="monthly">मासिक</option>
                      <option value="yearly">वार्षिक</option>
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label>बिलाचा फोटो</label>
                  <div className="image-upload-buttons">
                    <button type="button" className="gallery-btn" onClick={openReceiptGallery}>🖼️ गॅलरी</button>
                    <button type="button" className="camera-btn" onClick={openReceiptCamera}>📷 कॅमेरा</button>
                  </div>
                  <input ref={receiptGalleryRef} type="file" accept="image/*" onChange={handleReceiptCapture} style={{display:'none'}} />
                  <input ref={receiptCameraRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptCapture} style={{display:'none'}} />
                  {receiptPreview && <img src={receiptPreview} alt="receipt preview" className="receipt-preview" />}
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'जोडत आहे...' : 'खर्च जोडा'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmManagement;