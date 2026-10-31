import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Eye, Star, ChevronRight, Heart, MessageSquare, Calendar, Tag, Package } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ComponentImage from '../components/ComponentImage';

export default function ComponentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBorrow, setShowBorrow] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ borrow_date: '', return_date: '', request_message: '' });
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    api.get(`/components/${id}`).then(r => { setComp(r.data.data); setLoading(false); }).catch(() => { setLoading(false); });
    if (user) api.get(`/wishlist/check/${id}`).then(r => setWishlisted(r.data.data.wishlisted)).catch(() => {});
    // Track recently viewed
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter(v => v !== parseInt(id));
    filtered.unshift(parseInt(id));
    localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
  }, [id, user]);

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post('/borrow-requests', { component_id: parseInt(id), ...borrowForm });
      toast.success('Borrow request sent!');
      setShowBorrow(false);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send request');
    }
  };

  const toggleWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post('/wishlist/toggle', { component_id: parseInt(id) });
      setWishlisted(data.data.wishlisted);
      toast.success(data.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton h-96" /></div>;
  if (!comp) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h2 className="text-xl font-bold">Component not found</h2><Link to="/browse" className="text-electric-500 text-sm mt-2 inline-block">Back to browse</Link></div>;

  const conditionBadge = { new: 'bg-emerald-100 text-emerald-700', like_new: 'bg-blue-100 text-blue-700', good: 'bg-amber-100 text-amber-700', fair: 'bg-gray-100 text-gray-700' };
  const typeBadge = { lend: 'bg-electric-100 text-electric-700', rent: 'bg-purple-100 text-purple-700', trade: 'bg-amber-100 text-amber-700', giveaway: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link to="/browse" className="hover:text-gray-900 dark:hover:text-gray-200">Browse</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-gray-100 truncate">{comp.title}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left - Images / Info */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card overflow-hidden">
            <ComponentImage component={comp} className="h-64 sm:h-80" imgClassName="w-full h-full object-contain p-6" />
            {comp.image_urls?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {comp.image_urls.map((url, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="card p-5">
            <h2 className="text-xl font-bold mb-1">{comp.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`badge ${conditionBadge[comp.condition]}`}>{comp.condition?.replace('_', ' ')}</span>
              <span className={`badge ${typeBadge[comp.listing_type]}`}>{comp.listing_type}</span>
              <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{comp.category_name}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">{comp.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {comp.brand && <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Brand:</span><span className="font-medium">{comp.brand}</span></div>}
              {comp.model_number && <div className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Model:</span><span className="font-medium">{comp.model_number}</span></div>}
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Location:</span><span className="font-medium">{comp.location}</span></div>
              <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Views:</span><span className="font-medium">{comp.views_count}</span></div>
              <div className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Available:</span><span className="font-medium">{comp.available_quantity}/{comp.quantity}</span></div>
              {comp.price_per_day > 0 && <div className="flex items-center gap-2"><span className="text-gray-500">Price:</span><span className="font-semibold text-electric-600">Rs.{comp.price_per_day}/day</span></div>}
            </div>

            {comp.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {comp.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">#{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Right - Actions & Owner */}
        <div className="lg:col-span-2 space-y-4">
          {/* Owner card */}
          <div className="card p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Listed by</h3>
            <Link to={`/users/${comp.owner_id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                {comp.owner_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold group-hover:text-electric-500 transition-colors">{comp.owner_name}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {comp.owner_rating || '—'}
                  <span className="mx-1">·</span> {comp.owner_location}
                </div>
              </div>
            </Link>
          </div>

          {/* Actions */}
          {user && user.id !== comp.owner_id && (
            <div className="card p-5 space-y-3">
              <button onClick={() => setShowBorrow(true)} disabled={comp.available_quantity < 1}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> {comp.available_quantity < 1 ? 'Not Available' : 'Request to Borrow'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={toggleWishlist} className={`btn-secondary text-sm flex items-center justify-center gap-1.5 ${wishlisted ? 'text-red-500' : ''}`}>
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} /> {wishlisted ? 'Saved' : 'Wishlist'}
                </button>
                <Link to={`/messages?to=${comp.owner_id}&comp=${comp.id}`} className="btn-secondary text-sm flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              </div>
            </div>
          )}

          {/* Similar */}
          {comp.similar?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-3">Similar components</h3>
              <div className="space-y-2.5">
                {comp.similar.map(s => (
                  <Link key={s.id} to={`/components/${s.id}`} className="flex items-center gap-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                    <ComponentImage component={s} className="w-10 h-10 rounded-lg shrink-0" imgClassName="w-full h-full object-contain p-1" />
                    <div className="min-w-0"><p className="font-medium truncate">{s.title}</p><p className="text-xs text-gray-400">{s.category_name}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Borrow Modal */}
      {showBorrow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBorrow(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Request to borrow</h3>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Borrow Date</label><input type="date" required value={borrowForm.borrow_date} onChange={e => setBorrowForm({...borrowForm, borrow_date: e.target.value})} className="input-field text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Return Date</label><input type="date" required value={borrowForm.return_date} onChange={e => setBorrowForm({...borrowForm, return_date: e.target.value})} className="input-field text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Message to owner</label><textarea value={borrowForm.request_message} onChange={e => setBorrowForm({...borrowForm, request_message: e.target.value})} className="input-field h-24 resize-none text-sm" placeholder="Why do you need this component?" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBorrow(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
