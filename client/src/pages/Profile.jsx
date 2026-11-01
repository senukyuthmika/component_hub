import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Star, Calendar, Trash2, ShieldCheck, MapPin, Phone, Mail, 
  Inbox, Send, Check, X as XIcon, Clock, RotateCcw, AlertCircle, 
  Sparkles, Package, ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'outgoing', 'edit'
  const [form, setForm] = useState({ full_name: '', phone: '', location: '', bio: '' });
  const [showDelete, setShowDelete] = useState(false);
  
  // Requests data
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [respondId, setRespondId] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');

  const isCoordinator = user?.role === 'lab_admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (user) {
      setForm({ 
        full_name: user.full_name || '', 
        phone: user.phone || '', 
        location: user.location || '', 
        bio: user.bio || '' 
      });
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const [incRes, outRes] = await Promise.all([
        api.get('/borrow-requests/incoming'),
        api.get('/borrow-requests/outgoing')
      ]);
      setIncoming(incRes.data.data || []);
      setOutgoing(outRes.data.data || []);
    } catch {
      // quiet fallback
    }
    setLoadingRequests(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.data);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/borrow-requests/${id}/status`, { status, response_message: responseMsg });
      toast.success(`Request ${status}`);
      setRespondId(null);
      setResponseMsg('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/borrow-requests/${id}/cancel`);
      toast.success('Request cancelled');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const locations = [
    'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5',
    'Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Hostel Block D', 'Hostel Block E', 'Hostel Block F',
    'Off-campus'
  ];

  const statusColors = { 
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50', 
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50', 
    denied: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50', 
    returned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50', 
    overdue: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200 border border-red-400', 
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-700' 
  };

  const pendingIncomingCount = incoming.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      
      {/* =========================================================================
          PROFILE HEADER CARD
         ========================================================================= */}
      <div className="card p-6 sm:p-8 mb-8 border border-white/10 relative overflow-hidden bg-white dark:bg-[#0E243A]">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C26F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            
            {/* Hexagon / Circular Avatar */}
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#00C26F] to-emerald-800 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#00C26F]/20">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              {isCoordinator && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00C26F] text-[#07131F] flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {user?.full_name}
                </h1>
                
                {isCoordinator ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C26F]/20 text-[#00C26F] border border-[#00C26F]/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Lab Coordinator
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Student
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#00C26F]" /> {user?.email}</span>
                {user?.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#00C26F]" /> {user?.phone}</span>}
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#00C26F]" /> {user?.location || 'Campus'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#00C26F]" /> Joined {new Date(user?.created_at).toLocaleDateString()}</span>
              </div>

              {user?.bio && (
                <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-3">
              <span className="text-2xl font-black text-gray-900 dark:text-white block">
                {incoming.length}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Incoming
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
            <div className="text-center px-3">
              <span className="text-2xl font-black text-[#00C26F] block">
                {pendingIncomingCount}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C26F]">
                Pending
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
            <div className="text-center px-3">
              <span className="text-2xl font-black text-gray-900 dark:text-white block">
                {outgoing.length}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Outgoing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB NAVIGATION
         ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 dark:bg-[#0E243A] rounded-2xl mb-6 w-fit border border-gray-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-white dark:bg-[#07131F] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4 text-[#00C26F]" />
          <span>Incoming Requests</span>
          {pendingIncomingCount > 0 && (
            <span className="w-5 h-5 bg-[#00C26F] text-[#07131F] text-[10px] font-black rounded-full flex items-center justify-center">
              {pendingIncomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'outgoing'
              ? 'bg-white dark:bg-[#07131F] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4 text-blue-400" />
          <span>My Outgoing Requests</span>
          <span className="text-xs text-gray-400">({outgoing.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'edit'
              ? 'bg-white dark:bg-[#07131F] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: INCOMING REQUESTS
         ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#00C26F]" />
                {isCoordinator ? 'Lab Hardware Requests (Campus Oversight)' : 'Borrow Requests for My Listings'}
              </h2>
              <p className="text-xs text-gray-500">
                {isCoordinator 
                  ? 'All student hardware requests across campus labs are routed here for coordinator review and approval.' 
                  : 'Requests submitted by students wishing to borrow your listed hardware components.'}
              </p>
            </div>
            <Link 
              to="/requests" 
              className="text-xs font-bold text-[#00C26F] hover:underline flex items-center gap-1"
            >
              Full Requests View <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingRequests ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : incoming.length === 0 ? (
            <div className="card p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No incoming requests yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                When students request hardware components, they will be listed here with requester details and quick approval actions.
              </p>
            </div>
          ) : (
            incoming.map(r => (
              <div 
                key={r.id} 
                className={`card p-5 border transition-all ${
                  r.status === 'pending' 
                    ? 'border-[#00C26F]/40 shadow-sm bg-white dark:bg-[#0E243A]' 
                    : 'border-gray-100 dark:border-white/5 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 text-xl">
                      {r.status === 'pending' ? '⏳' : r.status === 'approved' ? '✅' : r.status === 'denied' ? '❌' : r.status === 'returned' ? '↩️' : '📦'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/components/${r.component_id}`} className="font-bold text-base hover:text-[#00C26F] transition-colors">
                          {r.component_title}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#00C26F]" />
                          Requester: {r.requester_name}
                        </span>

                        {isCoordinator && r.lender_name && (
                          <span>
                            · Owner: <strong className="text-gray-700 dark:text-gray-300">{r.lender_name}</strong>
                          </span>
                        )}

                        {r.component_location && (
                          <span className="text-[#00C26F] font-semibold flex items-center gap-0.5">
                            · <MapPin className="w-3 h-3" /> {r.component_location}
                          </span>
                        )}

                        <span>· {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>

                      {r.request_message && (
                        <div className="mt-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                          <span className="font-semibold text-gray-500 text-[11px] block mb-0.5">Student Note:</span>
                          "{r.request_message}"
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-4">
                        {r.borrow_date && <span>Borrow: <strong className="text-gray-700 dark:text-gray-300">{r.borrow_date}</strong></span>}
                        {r.return_date && <span>Return: <strong className="text-gray-700 dark:text-gray-300">{r.return_date}</strong></span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0">
                    <span className={`badge uppercase tracking-wider text-[11px] font-bold ${statusColors[r.status] || ''}`}>
                      {r.status}
                    </span>

                    {r.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(r.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-[#00C26F] hover:bg-[#00D87B] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                        </button>
                        <button
                          onClick={() => setRespondId(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <XIcon className="w-3.5 h-3.5" /> Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: OUTGOING REQUESTS
         ========================================================================= */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                My Outgoing Requests
              </h2>
              <p className="text-xs text-gray-500">Hardware requests you have submitted to borrow from campus labs or peers.</p>
            </div>
            <Link to="/browse" className="text-xs font-bold text-[#00C26F] hover:underline flex items-center gap-1">
              Browse More <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingRequests ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          ) : outgoing.length === 0 ? (
            <div className="card p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No outgoing requests</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Explore the campus catalog to find microcontrollers, sensors, or tools for your projects.
              </p>
              <Link to="/browse" className="btn-lab-green text-xs font-bold px-4 py-2 mt-4 inline-flex items-center gap-1.5">
                Browse Components
              </Link>
            </div>
          ) : (
            outgoing.map(r => (
              <div key={r.id} className="card p-5 border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0E243A]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 text-xl">
                      📦
                    </div>
                    <div>
                      <Link to={`/components/${r.component_id}`} className="font-bold text-base hover:text-[#00C26F] transition-colors">
                        {r.component_title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Owner: <strong className="text-gray-700 dark:text-gray-300">{r.lender_name}</strong> · Requested on {new Date(r.created_at).toLocaleDateString()}
                      </p>
                      {r.request_message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg">
                          "{r.request_message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3">
                    <span className={`badge uppercase tracking-wider text-[11px] font-bold ${statusColors[r.status] || ''}`}>
                      {r.status}
                    </span>
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-600 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: EDIT PROFILE FORM & DANGER ZONE
         ========================================================================= */}
      {activeTab === 'edit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6 sm:p-8 bg-white dark:bg-[#0E243A] border border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Profile Information</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Full Name
                </label>
                <input 
                  value={form.full_name} 
                  onChange={e => setForm({...form, full_name: e.target.value})} 
                  className="input-field" 
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    className="input-field" 
                    placeholder="077-xxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Primary Campus Location
                  </label>
                  <select 
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})} 
                    className="input-field"
                  >
                    <option value="">Select Primary Lab / Block</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Bio / Lab Focus
                </label>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm({...form, bio: e.target.value})} 
                  className="input-field h-24 resize-none" 
                  placeholder="Tell peers and lab members about your projects, department, or research interests..."
                />
              </div>

              <button type="submit" className="btn-lab-green font-bold text-sm px-6 py-2.5">
                Save Changes
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
            <h3 className="font-bold text-base text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Deleting your account will permanently remove all your listings, borrow requests, notifications, and reviews. This action cannot be reversed.
            </p>
            <button 
              onClick={() => setShowDelete(true)} 
              className="btn-danger text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete Account Permanently
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          DENY CONFIRMATION MODAL
         ========================================================================= */}
      {respondId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRespondId(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in bg-white dark:bg-[#0E243A] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Deny Request</h3>
            <p className="text-xs text-gray-500 mb-3">Provide an optional reason to explain why this hardware cannot be issued at this time.</p>
            <textarea 
              value={responseMsg} 
              onChange={e => setResponseMsg(e.target.value)} 
              className="input-field h-24 resize-none text-sm mb-4" 
              placeholder="e.g. Component currently booked for scheduled laboratory practical" 
            />
            <div className="flex gap-3">
              <button onClick={() => setRespondId(null)} className="btn-secondary flex-1 text-xs font-bold">Cancel</button>
              <button onClick={() => handleRespond(respondId, 'denied')} className="btn-danger flex-1 text-xs font-bold">Confirm Deny</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE ACCOUNT MODAL
         ========================================================================= */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDelete(false)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in bg-white dark:bg-[#0E243A] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              All data including your components, borrow history, and credentials will be permanently erased.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1 text-xs font-bold">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1 text-xs font-bold">Delete Forever</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
