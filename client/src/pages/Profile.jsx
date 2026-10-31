import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Star, Package, Calendar, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', location: '', bio: '' });
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.data);
      toast.success('Profile updated');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch { toast.error('Failed'); }
  };

  const locations = ['Lab 1','Lab 2','Lab 3','Lab 4','Lab 5','Hostel Block A','Hostel Block B','Hostel Block C','Hostel Block D','Hostel Block E','Hostel Block F','Off-campus'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-lg">{user?.full_name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {user?.rating || 0}</span>
              <span className="capitalize badge bg-electric-50 text-electric-600">{user?.role}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(user?.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Location</label>
            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field">
              <option value="">Select</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Bio</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="input-field h-24 resize-none" /></div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card p-5 border-red-200 dark:border-red-900">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-3">Deleting your account will remove all your listings, requests, reviews and messages permanently.</p>
        <button onClick={() => setShowDelete(true)} className="btn-danger text-sm flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Delete Account</button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDelete(false)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-5">All data will be permanently removed. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
