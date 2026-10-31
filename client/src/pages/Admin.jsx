import { useState, useEffect } from 'react';
import { Shield, Users, Package, Download, Trash2, Check } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.data)).catch(() => {});
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/dashboard/charts').then(r => setCharts(r.data.data)).catch(() => {});
    api.get('/dashboard/recent-activity').then(r => setActivity(r.data.data)).catch(() => {});
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}`, { role });
      setUsers(u => u.map(user => user.id === id ? { ...user, role } : user));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  const verifyUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, { is_verified: 1 });
      setUsers(u => u.map(user => user.id === id ? { ...user, is_verified: 1 } : user));
      toast.success('User verified');
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(user => user.id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const exportCSV = () => {
    window.open('/api/dashboard/export-history', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-electric-500" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users },
            { label: 'Total Components', value: stats.totalComponents, icon: Package },
            { label: 'Active Requests', value: stats.activeRequests, icon: Shield },
            { label: 'Completed Borrows', value: stats.totalBorrowed, icon: Check },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <s.icon className="w-5 h-5 text-electric-500 mb-2" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {['users', 'analytics', 'logs'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold">User Management ({users.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left p-3 font-medium text-gray-500">User</th>
              <th className="text-left p-3 font-medium text-gray-500 hidden sm:table-cell">Email</th>
              <th className="text-left p-3 font-medium text-gray-500">Role</th>
              <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Verified</th>
              <th className="text-right p-3 font-medium text-gray-500">Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="p-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent">
                      <option value="student">student</option><option value="lab_admin">lab_admin</option><option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {u.is_verified ? <span className="text-emerald-500 text-xs">✓ Verified</span> :
                      <button onClick={() => verifyUser(u.id)} className="text-xs text-electric-500 hover:underline">Verify</button>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'analytics' && charts && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Borrow Requests Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.requestsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="month" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} />
                <Tooltip /><Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Components by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" tick={{fontSize:10}} /><YAxis tick={{fontSize:12}} />
                <Tooltip /><Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Export Data</h3>
            </div>
            <button onClick={exportCSV} className="btn-primary text-sm flex items-center gap-1.5"><Download className="w-4 h-4" /> Export Borrow History (CSV)</button>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4">System Activity Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50 dark:border-gray-800/50">
                <div className="w-2 h-2 rounded-full bg-electric-400 mt-2 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{a.full_name}</span> — <span className="text-gray-500">{a.action}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.entity_type} #{a.entity_id}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
