import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ComponentImage from '../components/ComponentImage';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => { setItems(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const remove = async (compId) => {
    await api.delete(`/wishlist/${compId}`);
    setItems(items.filter(i => i.component_id !== compId));
    toast.success('Removed from wishlist');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div> :
        items.length === 0 ? (
          <div className="text-center py-20 card"><Heart className="w-14 h-14 text-gray-200 mx-auto mb-3" /><h3 className="font-semibold">Wishlist empty</h3><p className="text-sm text-gray-500 mt-1">Save components you're interested in</p><Link to="/browse" className="btn-primary text-sm mt-4 inline-block">Browse Components</Link></div>
        ) : (
          <div className="space-y-3">
            {items.map(i => (
              <div key={i.id} className="card p-4 flex items-center gap-4">
                <ComponentImage component={i} className="w-14 h-14 rounded-xl shrink-0" imgClassName="w-full h-full object-contain p-1.5" />
                <div className="flex-1 min-w-0">
                  <Link to={`/components/${i.component_id}`} className="font-semibold text-sm hover:text-electric-500">{i.title}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">{i.category_name} · by {i.owner_name} · {i.condition?.replace('_', ' ')}</p>
                </div>
                <button onClick={() => remove(i.component_id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
