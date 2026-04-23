import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../style/TaskManager.css';


const API = process.env.REACT_APP_API_URL;

function TaskManager() {
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    crop_name: '',
    land_name: '',
    due_date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const url = filter === 'all' 
        ? `${API}/farm/tasks`
        : `${API}/farm/tasks?status=${filter}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      toast.error('कार्ये मिळवताना त्रुटी');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('कृपया कार्याचे शीर्षक द्या');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTask) {
        await axios.put(`${API}/farm/tasks/${editingTask.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('कार्य अद्यतनित केले');
      } else {
        await axios.post(`${API}/farm/tasks`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('कार्य जोडले');
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'कार्य जोडताना त्रुटी');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await axios.put(`${API}/farm/tasks/${task.id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`कार्य ${newStatus === 'completed' ? 'पूर्ण' : 'प्रलंबित'} म्हणून चिन्हांकित केले`);
      fetchTasks();
    } catch (err) {
      toast.error('स्थिती बदलताना त्रुटी');
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('हे कार्य हटवायचे?')) {
      try {
        await axios.delete(`${API}/farm/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('कार्य हटवले');
        fetchTasks();
      } catch (err) {
        toast.error('हटवताना त्रुटी');
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      crop_name: '',
      land_name: '',
      due_date: new Date().toISOString().split('T')[0]
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const editTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      crop_name: task.crop_name || '',
      land_name: task.land_name || '',
      due_date: task.due_date
    });
    setShowForm(true);
  };

  return (
    <div className="task-manager-container">
      <div className="task-header">
        <h2>📋 डिजिटल फार्म जर्नल</h2>
        <button className="add-task-btn" onClick={() => setShowForm(true)}>➕ नवीन कार्य</button>
      </div>

      <div className="filter-bar">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>सर्व</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>प्रलंबित</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>पूर्ण</button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content task-form" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'कार्य संपादित करा' : 'नवीन कार्य जोडा'}</h3>
              <button className="close-modal" onClick={() => resetForm()}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="कार्याचे शीर्षक *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <textarea placeholder="तपशील (पर्यायी)" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <input type="text" placeholder="पीक (पर्यायी)" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} />
              <input type="text" placeholder="शेत (पर्यायी)" value={form.land_name} onChange={e => setForm({...form, land_name: e.target.value})} />
              <label>अंतिम तारीख</label>
              <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required />
              <button type="submit" disabled={submitting}>{submitting ? 'प्रक्रिया...' : (editingTask ? 'अद्यतन करा' : 'जोडा')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">अद्याप कोणतेही कार्य नाही. "नवीन कार्य" बटणावर क्लिक करून प्रारंभ करा.</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
              <div className="task-info">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
                <div className="task-meta">
                  {task.crop_name && <span>🌾 {task.crop_name}</span>}
                  {task.land_name && <span>🚜 {task.land_name}</span>}
                  <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="status-toggle" onClick={() => handleStatusToggle(task)}>
                  {task.status === 'pending' ? '✅ पूर्ण करा' : '🔄 पुन्हा उघडा'}
                </button>
                <button className="edit-btn" onClick={() => editTask(task)}>✏️</button>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskManager;