import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Send, Check, X as XIcon, RotateCcw, Clock, Star } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Requests() {
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondId, setRespondId] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([api.get('/borrow-requests/incoming'), api.get('/borrow-requests/outgoing')]);
      setIncoming(inc.data.data);
      setOutgoing(out.data.data);
    } catch { }
    setLoading(false);
  };

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/borrow-requests/${id}/status`, { status, response_message: responseMsg });
      toast.success(`Request ${status}`);
      setRespondId(null); setResponseMsg('');
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/borrow-requests/${id}/cancel`);
      toast.success('Request cancelled');
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const handleReturn = async (id) => {
    try {
      await api.put(`/borrow-requests/${id}/status`, { status: 'returned' });
      toast.success('Marked as returned');
      fetchRequests();
    } catch { toast.error('Failed'); }
  };

  const handleReview = async () => {
    try {
      await api.post('/reviews', { request_id: reviewModal, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(null); setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const statusColors = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', denied: 'bg-red-100 text-red-700', returned: 'bg-blue-100 text-blue-700', overdue: 'bg-red-200 text-red-800', cancelled: 'bg-gray-100 text-gray-500' };

  const RequestCard = ({ r, isIncoming }) => (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xl">
          {r.status === 'pending' ? '⏳' : r.status === 'approved' ? '✅' : r.status === 'denied' ? '❌' : r.status === 'returned' ? '↩️' : '⚠️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/components/${r.component_id}`} className="font-semibold text-sm hover:text-electric-500">{r.component_title}</Link>
              <p className="text-xs text-gray-500 mt-0.5">
                {isIncoming ? `From: ${r.requester_name}` : `To: ${r.lender_name}`} · {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`badge ${statusColors[r.status]}`}>{r.status}</span>
          </div>
          {r.request_message && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">"{r.request_message}"</p>}
          {r.response_message && <p className="text-sm text-emerald-600 mt-1 italic">↳ {r.response_message}</p>}
          <div className="text-xs text-gray-400 mt-2">
            {r.borrow_date && <span>Borrow: {r.borrow_date}</span>} {r.return_date && <span> · Return: {r.return_date}</span>}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {isIncoming && r.status === 'pending' && (
              <>
                <button onClick={() => handleRespond(r.id, 'approved')} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"><Check className="w-3 h-3" /> Approve</button>
                <button onClick={() => { setRespondId(r.id); }} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1"><XIcon className="w-3 h-3" /> Deny</button>
              </>
            )}
            {isIncoming && r.status === 'approved' && (
              <button onClick={() => handleReturn(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Mark Returned</button>
            )}
            {!isIncoming && r.status === 'pending' && (
              <button onClick={() => handleCancel(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"><XIcon className="w-3 h-3" /> Cancel</button>
            )}
            {r.status === 'returned' && (
              <button onClick={() => setReviewModal(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-1"><Star className="w-3 h-3" /> Leave Review</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Borrow Requests</h1>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        <button onClick={() => setTab('incoming')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'incoming' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>
          <Inbox className="w-4 h-4" /> Incoming {incoming.filter(r => r.status === 'pending').length > 0 && <span className="w-5 h-5 bg-electric-500 text-white text-[10px] rounded-full flex items-center justify-center">{incoming.filter(r => r.status === 'pending').length}</span>}
        </button>
        <button onClick={() => setTab('outgoing')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'outgoing' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>
          <Send className="w-4 h-4" /> Outgoing
        </button>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-32" />)}</div> :
        list.length === 0 ? (
          <div className="text-center py-16 card">
            <Clock className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold">No {tab} requests</h3>
            <p className="text-sm text-gray-500 mt-1">{tab === 'incoming' ? 'When someone wants to borrow your components, requests show here' : 'Submit a borrow request from any component page'}</p>
          </div>
        ) : (
          <div className="space-y-3">{list.map(r => <RequestCard key={r.id} r={r} isIncoming={tab === 'incoming'} />)}</div>
        )}

      {/* Deny Modal */}
      {respondId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRespondId(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-3">Deny Request</h3>
            <textarea value={responseMsg} onChange={e => setResponseMsg(e.target.value)} className="input-field h-20 resize-none text-sm mb-3" placeholder="Reason (optional)" />
            <div className="flex gap-3">
              <button onClick={() => setRespondId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleRespond(respondId, 'denied')} className="btn-danger flex-1">Deny</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-3">Leave a Review</h3>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} className="text-2xl">
                  {s <= reviewForm.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="input-field h-20 resize-none text-sm mb-3" placeholder="How was your experience?" />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReview} className="btn-primary flex-1">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
