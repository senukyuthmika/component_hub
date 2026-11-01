import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Inbox, Send, Check, X as XIcon, RotateCcw, Clock, Star, MapPin, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondId, setRespondId] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const isCoordinator = user?.role === 'lab_admin' || user?.role === 'superadmin';

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.get('/borrow-requests/incoming'), 
        api.get('/borrow-requests/outgoing')
      ]);
      setIncoming(inc.data.data);
      setOutgoing(out.data.data);
    } catch { }
    setLoading(false);
  };

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/borrow-requests/${id}/status`, { status, response_message: responseMsg });
      toast.success(`Request ${status}`);
      setRespondId(null); 
      setResponseMsg('');
      fetchRequests();
    } catch (err) { 
      toast.error(err.response?.data?.error?.message || 'Failed'); 
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/borrow-requests/${id}/cancel`);
      toast.success('Request cancelled');
      fetchRequests();
    } catch (err) { 
      toast.error(err.response?.data?.error?.message || 'Failed'); 
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.put(`/borrow-requests/${id}/status`, { status: 'returned' });
      toast.success('Marked as returned');
      fetchRequests();
    } catch { 
      toast.error('Failed'); 
    }
  };

  const handleReview = async () => {
    try {
      await api.post('/reviews', { request_id: reviewModal, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(null); 
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { 
      toast.error(err.response?.data?.error?.message || 'Failed'); 
    }
  };

  const statusColors = { 
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', 
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', 
    denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
    returned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
    overdue: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300', 
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' 
  };

  const RequestCard = ({ r, isIncoming }) => {
    const canManageIncoming = isIncoming && (r.lender_id === user?.id || isCoordinator);

    return (
      <div className="card p-5 animate-fade-in hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xl">
            {r.status === 'pending' ? '⏳' : r.status === 'approved' ? '✅' : r.status === 'denied' ? '❌' : r.status === 'returned' ? '↩️' : '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to={`/components/${r.component_id}`} className="font-bold text-base hover:text-[#00C26F] transition-colors">
                  {r.component_title}
                </Link>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#00C26F]" />
                    {isIncoming ? `Requester: ${r.requester_name}` : `Owner: ${r.lender_name}`}
                  </span>
                  
                  {isIncoming && isCoordinator && r.lender_name && r.lender_id !== user?.id && (
                    <span>· Owner: <strong className="text-gray-700 dark:text-gray-300">{r.lender_name}</strong></span>
                  )}
                  
                  {r.component_location && (
                    <span className="text-[#00C26F] font-semibold flex items-center gap-0.5">
                      · <MapPin className="w-3 h-3" /> {r.component_location}
                    </span>
                  )}
                  
                  <span>· {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`badge ${statusColors[r.status]}`}>{r.status}</span>
            </div>

            {r.request_message && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                <span className="font-semibold text-gray-500 text-xs block mb-0.5">Message from student:</span>
                "{r.request_message}"
              </div>
            )}

            {r.response_message && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 italic">
                ↳ {r.response_message}
              </p>
            )}

            <div className="text-xs text-gray-400 mt-2.5 flex items-center gap-3">
              {r.borrow_date && <span>Borrow: <strong className="text-gray-700 dark:text-gray-300">{r.borrow_date}</strong></span>}
              {r.return_date && <span>Return: <strong className="text-gray-700 dark:text-gray-300">{r.return_date}</strong></span>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
              {canManageIncoming && r.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleRespond(r.id, 'approved')} 
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-[#00C26F] text-white hover:bg-[#00D87B] shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve Request
                  </button>
                  <button 
                    onClick={() => { setRespondId(r.id); }} 
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 flex items-center gap-1.5 transition-all"
                  >
                    <XIcon className="w-3.5 h-3.5" /> Deny
                  </button>
                </>
              )}

              {canManageIncoming && r.status === 'approved' && (
                <button 
                  onClick={() => handleReturn(r.id)} 
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mark as Returned
                </button>
              )}

              {!isIncoming && r.status === 'pending' && (
                <button 
                  onClick={() => handleCancel(r.id)} 
                  className="text-xs font-medium px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 flex items-center gap-1.5 transition-all"
                >
                  <XIcon className="w-3.5 h-3.5" /> Cancel Request
                </button>
              )}

              {r.status === 'returned' && (
                <button 
                  onClick={() => setReviewModal(r.id)} 
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 flex items-center gap-1.5 transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> Leave Star Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Page Title & Coordinator Overview Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Borrow Requests
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track and manage hardware component requests across campus
          </p>
        </div>

        {isCoordinator && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C26F]/10 text-[#00C26F] border border-[#00C26F]/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00C26F]" />
            Lab Coordinator Oversight
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6 w-fit">
        <button 
          onClick={() => setTab('incoming')} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'incoming' 
              ? 'bg-white dark:bg-[#0E243A] text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" /> 
          <span>Incoming Requests</span>
          {incoming.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-5 h-5 bg-[#00C26F] text-[#07131F] text-[10px] font-black rounded-full flex items-center justify-center">
              {incoming.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setTab('outgoing')} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'outgoing' 
              ? 'bg-white dark:bg-[#0E243A] text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" /> 
          <span>My Outgoing Requests</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <Clock className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">No {tab} requests found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {tab === 'incoming' 
              ? 'When students submit borrow requests for components, they will appear here for review and approval.' 
              : 'Browse components and submit your first borrow request.'}
          </p>
          {tab === 'outgoing' && (
            <Link to="/browse" className="btn-lab-green text-xs font-bold px-5 py-2.5 mt-4 inline-flex items-center gap-1.5">
              Browse Components
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(r => (
            <RequestCard key={r.id} r={r} isIncoming={tab === 'incoming'} />
          ))}
        </div>
      )}

      {/* Deny Modal */}
      {respondId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRespondId(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Deny Request</h3>
            <p className="text-xs text-gray-500 mb-3">Provide an optional reason to explain why this request cannot be fulfilled at this time.</p>
            <textarea 
              value={responseMsg} 
              onChange={e => setResponseMsg(e.target.value)} 
              className="input-field h-24 resize-none text-sm mb-4" 
              placeholder="e.g. Component currently reserved for Lab 1 workshop" 
            />
            <div className="flex gap-3">
              <button onClick={() => setRespondId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleRespond(respondId, 'denied')} className="btn-danger flex-1 font-bold">Confirm Deny</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Leave a Review</h3>
            <p className="text-xs text-gray-500 mb-3">Rate the condition of the returned hardware and exchange experience.</p>
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} className="text-3xl hover:scale-110 transition-transform">
                  {s <= reviewForm.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea 
              value={reviewForm.comment} 
              onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} 
              className="input-field h-24 resize-none text-sm mb-4" 
              placeholder="How was the component condition and return punctuality?" 
            />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReview} className="btn-lab-green flex-1 font-bold">Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
