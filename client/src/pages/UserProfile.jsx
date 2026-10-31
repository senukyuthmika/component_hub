import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar } from 'lucide-react';
import api from '../services/api';
import ComponentImage from '../components/ComponentImage';

export default function UserProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="skeleton h-64" /></div>;
  if (!data) return <div className="text-center py-20"><h2 className="text-xl font-bold">User not found</h2></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">{data.full_name?.charAt(0)}</div>
          <div>
            <h1 className="text-xl font-bold">{data.full_name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {data.rating || '—'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {data.location || 'N/A'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(data.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {data.bio && <p className="text-sm text-gray-600 dark:text-gray-400">{data.bio}</p>}
      </div>

      <h2 className="font-bold text-lg mb-3">Listed Components ({data.components.length})</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {data.components.map(c => (
          <Link key={c.id} to={`/components/${c.id}`} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <ComponentImage component={c} className="w-12 h-12 rounded-xl shrink-0" imgClassName="w-full h-full object-contain p-1" />
              <div className="min-w-0"><h3 className="font-medium text-sm truncate">{c.title}</h3><p className="text-xs text-gray-500">{c.category_name}</p></div>
            </div>
          </Link>
        ))}
        {data.components.length === 0 && <p className="text-sm text-gray-400 col-span-2">No listings yet</p>}
      </div>

      <h2 className="font-bold text-lg mb-3">Reviews ({data.reviews.length})</h2>
      <div className="space-y-3">
        {data.reviews.map(r => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{r.reviewer_name}</span>
              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}</div>
              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>}
          </div>
        ))}
        {data.reviews.length === 0 && <p className="text-sm text-gray-400">No reviews yet</p>}
      </div>
    </div>
  );
}
