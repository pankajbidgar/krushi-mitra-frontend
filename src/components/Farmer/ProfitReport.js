import React, { useState, useEffect } from 'react';
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../style/ProfitReport.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function ProfitReport() {
  const token = localStorage.getItem('token');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    crop_name: '',
    land_name: ''
  });
  const [cropsList, setCropsList] = useState([]);
  const [landsList, setLandsList] = useState([]);

  // Fetch available crops and lands from expenses
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get('http://localhost:8000/farm/expenses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const crops = [...new Set(res.data.map(e => e.crop_name).filter(c => c))];
        const lands = [...new Set(res.data.map(e => e.land_name).filter(l => l))];
        setCropsList(crops);
        setLandsList(lands);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilters();
  }, []);

//   const fetchReport = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:8000/farm/profit-report', filters, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setReport(res.data);
//     } catch (err) {
//       toast.error('रिपोर्ट मिळवताना त्रुटी');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReport();
//   }, []);

const fetchReport = async () => {
  setLoading(true);
  try {
    const payload = {
      start_date: filters.start_date || null,
      end_date: filters.end_date || null,
      crop_name: filters.crop_name || null,
      land_name: filters.land_name || null,
    };
    const res = await axios.post('http://localhost:8000/farm/profit-report', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setReport(res.data);
  } catch (err) {
    toast.error('रिपोर्ट मिळवताना त्रुटी');
  } finally {
    setLoading(false);
  }
};

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchReport();
  };

  const resetFilters = () => {
    setFilters({ start_date: '', end_date: '', crop_name: '', land_name: '' });
    fetchReport();
  };

  // Chart data for monthly profit
  const monthlyData = {
    labels: report?.monthly_breakdown.map(m => m.month) || [],
    datasets: [
      {
        label: 'उत्पन्न (₹)',
        data: report?.monthly_breakdown.map(m => m.revenue) || [],
        backgroundColor: '#4caf50',
      },
      {
        label: 'खर्च (₹)',
        data: report?.monthly_breakdown.map(m => m.expenses) || [],
        backgroundColor: '#f44336',
      },
      {
        label: 'नफा (₹)',
        data: report?.monthly_breakdown.map(m => m.profit) || [],
        backgroundColor: '#2196f3',
      },
    ],
  };

  const expensePieData = report?.expense_breakdown ? {
    labels: Object.keys(report.expense_breakdown).map(cat => {
      if (cat === 'seeds') return 'बियाणे';
      if (cat === 'fertilizer') return 'खते';
      if (cat === 'labor') return 'मजुरी';
      if (cat === 'equipment') return 'साहित्य';
      return cat;
    }),
    datasets: [{
      data: Object.values(report.expense_breakdown),
      backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545', '#6c757d'],
    }]
  } : null;

  const downloadExcel = () => {
    if (!report) return;
    const wsData = [
      ['महिना', 'उत्पन्न (₹)', 'खर्च (₹)', 'नफा (₹)'],
      ...report.monthly_breakdown.map(m => [m.month, m.revenue, m.expenses, m.profit]),
      [],
      ['एकूण', report.total_revenue, report.total_expenses, report.profit]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profit Report');
    XLSX.writeFile(wb, `profit_report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.text('नफा/तोटा अहवाल', 14, 20);
    doc.text(`एकूण उत्पन्न: ₹${report.total_revenue.toFixed(2)}`, 14, 30);
    doc.text(`एकूण खर्च: ₹${report.total_expenses.toFixed(2)}`, 14, 40);
    doc.text(`नफा/तोटा: ₹${report.profit.toFixed(2)}`, 14, 50);
    
    const tableData = report.monthly_breakdown.map(m => [m.month, m.revenue, m.expenses, m.profit]);
    doc.autoTable({
      startY: 60,
      head: [['महिना', 'उत्पन्न (₹)', 'खर्च (₹)', 'नफा (₹)']],
      body: tableData,
    });
    doc.save(`profit_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="profit-report-container">
      <h2>📊 नफा / तोटा अहवाल</h2>
      
      <div className="filters">
        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
        <span>ते</span>
        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
        <select name="crop_name" value={filters.crop_name} onChange={handleFilterChange}>
          <option value="">सर्व पिके</option>
          {cropsList.map(crop => <option key={crop} value={crop}>{crop}</option>)}
        </select>
        <select name="land_name" value={filters.land_name} onChange={handleFilterChange}>
          <option value="">सर्व शेते</option>
          {landsList.map(land => <option key={land} value={land}>{land}</option>)}
        </select>
        <button onClick={applyFilters}>फिल्टर लावा</button>
        <button onClick={resetFilters}>रीसेट</button>
      </div>

      {loading && <div className="loading">लोड करत आहे...</div>}

      {report && (
        <>
          <div className="summary-cards">
            <div className="card revenue">💰 एकूण उत्पन्न: ₹{report.total_revenue.toFixed(2)}</div>
            <div className="card expense">💸 एकूण खर्च: ₹{report.total_expenses.toFixed(2)}</div>
            <div className={`card profit ${report.profit >= 0 ? 'positive' : 'negative'}`}>
              📊 नफा/तोटा: ₹{report.profit.toFixed(2)}
            </div>
          </div>

          <div className="chart-section">
            <h3>महिन्यानुसार विश्लेषण</h3>
            <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="chart-section">
            <h3>खर्चाची विभागणी</h3>
            {expensePieData && <Pie data={expensePieData} options={{ responsive: true }} />}
          </div>

          <div className="download-buttons">
            <button onClick={downloadExcel}>📎 Excel डाउनलोड करा</button>
            <button onClick={downloadPDF}>📄 PDF डाउनलोड करा</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitReport;