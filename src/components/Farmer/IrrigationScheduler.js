import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/IrrigationScheduler.css';

function IrrigationScheduler() {
  const token = localStorage.getItem('token');
  const [schedules, setSchedules] = useState([]);
  const [dueSchedules, setDueSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    land_name: '',
    crop_name: '',
    irrigation_method: 'drip',
    last_irrigation_date: '',
    next_irrigation_date: '',
    interval_days: 3,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:8000/farm/irrigation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      toast.error('सिंचन शेड्यूल मिळवताना त्रुटी');
    }
  };

  const fetchDueSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:8000/farm/irrigation/due', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDueSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchDueSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.next_irrigation_date) {
      toast.error('कृपया पुढील सिंचनाची तारीख निवडा');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/farm/irrigation/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('शेड्यूल अद्यतनित केले');
      } else {
        await axios.post('http://localhost:8000/farm/irrigation', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('शेड्यूल जोडले');
      }
      resetForm();
      fetchSchedules();
      fetchDueSchedules();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'शेड्यूल जोडताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      land_name: '',
      crop_name: '',
      irrigation_method: 'drip',
      last_irrigation_date: '',
      next_irrigation_date: '',
      interval_days: 3,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const editSchedule = (sch) => {
    setEditingId(sch.id);
    setForm({
      land_name: sch.land_name || '',
      crop_name: sch.crop_name || '',
      irrigation_method: sch.irrigation_method,
      last_irrigation_date: sch.last_irrigation_date || '',
      next_irrigation_date: sch.next_irrigation_date,
      interval_days: sch.interval_days,
      is_active: sch.is_active
    });
    setShowForm(true);
  };

  const deleteSchedule = async (id) => {
    if (window.confirm('हा शेड्यूल हटवायचा?')) {
      try {
        await axios.delete(`http://localhost:8000/farm/irrigation/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('शेड्यूल हटवले');
        fetchSchedules();
        fetchDueSchedules();
      } catch (err) {
        toast.error('हटवताना त्रुटी');
      }
    }
  };

  const completeIrrigation = async (id) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + schedule.interval_days);
    const updated = {
      ...schedule,
      last_irrigation_date: today,
      next_irrigation_date: nextDate.toISOString().split('T')[0]
    };
    try {
      await axios.put(`http://localhost:8000/farm/irrigation/${id}`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('सिंचन पूर्ण म्हणून नोंदवले');
      fetchSchedules();
      fetchDueSchedules();
    } catch (err) {
      toast.error('अपडेट करताना त्रुटी');
    }
  };

  return (
    <div className="irrigation-scheduler-container">
      <h2>💧 सिंचन शेड्यूलर</h2>

      {/* Due Alerts */}
      {dueSchedules.length > 0 && (
        <div className="due-alerts">
          <h3>⚠️ सिंचनाची गरज असलेली शेते</h3>
          {dueSchedules.map(sch => (
            <div key={sch.id} className="due-card">
              <div>{sch.land_name || 'शेत'} – {sch.crop_name || 'पीक'}</div>
              <div>नियोजित तारीख: {sch.next_irrigation_date}</div>
              <button onClick={() => completeIrrigation(sch.id)}>✅ सिंचन पूर्ण चिन्हांकित करा</button>
            </div>
          ))}
        </div>
      )}

      <button className="add-btn" onClick={() => setShowForm(true)}>➕ नवीन सिंचन शेड्यूल</button>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'शेड्यूल संपादित करा' : 'नवीन शेड्यूल'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="शेताचे नाव" value={form.land_name} onChange={e => setForm({...form, land_name: e.target.value})} />
              <input type="text" placeholder="पीक" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} />
              <select value={form.irrigation_method} onChange={e => setForm({...form, irrigation_method: e.target.value})}>
                <option value="drip">ठिबक सिंचन</option>
                <option value="sprinkler">फवारणी सिंचन</option>
                <option value="flood">पारंपारिक</option>
              </select>
              <label>शेवटचे सिंचन (पर्यायी)</label>
              <input type="date" value={form.last_irrigation_date} onChange={e => setForm({...form, last_irrigation_date: e.target.value})} />
              <label>पुढील सिंचनाची तारीख *</label>
              <input type="date" value={form.next_irrigation_date} onChange={e => setForm({...form, next_irrigation_date: e.target.value})} required />
              <label>किती दिवसांनी सिंचन करायचे?</label>
              <input type="number" min="1" value={form.interval_days} onChange={e => setForm({...form, interval_days: parseInt(e.target.value)})} />
              <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                सक्रिय
              </label>
              <button type="submit" disabled={loading}>{loading ? 'प्रक्रिया...' : (editingId ? 'अद्यतन करा' : 'जोडा')}</button>
              <button type="button" onClick={resetForm}>रद्द करा</button>
            </form>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="schedules-list">
        <h3>सिंचन शेड्यूल यादी</h3>
        {schedules.length === 0 ? (
          <p>अद्याप कोणतेही शेड्यूल नाही.</p>
        ) : (
          <table className="schedules-table">
            <thead>
              <tr>
                <th>शेत</th>
                <th>पीक</th>
                <th>पद्धत</th>
                <th>शेवटचे सिंचन</th>
                <th>पुढील सिंचन</th>
                <th>स्थिती</th>
                <th>कृती</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(sch => (
                <tr key={sch.id}>
                  <td>{sch.land_name || '—'}</td>
                  <td>{sch.crop_name || '—'}</td>
                  <td>{sch.irrigation_method === 'drip' ? 'ठिबक' : sch.irrigation_method === 'sprinkler' ? 'फवारणी' : 'पारंपारिक'}</td>
                  <td>{sch.last_irrigation_date || '—'}</td>
                  <td>{sch.next_irrigation_date} {new Date(sch.next_irrigation_date) <= new Date() && <span className="due-badge">योग्य वेळ</span>}</td>
                  <td>{sch.is_active ? '✅ सक्रिय' : '❌ निष्क्रिय'}</td>
                  <td>
                    <button onClick={() => editSchedule(sch)}>✏️</button>
                    <button onClick={() => deleteSchedule(sch.id)}>🗑️</button>
                    <button onClick={() => completeIrrigation(sch.id)}>💧 सिंचन झाले</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default IrrigationScheduler;