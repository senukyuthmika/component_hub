import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Cpu, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', brand: '', model_number: '', condition: 'good', listing_type: 'lend', price_per_day: '', quantity: 1, tags: '', location: '', lab_name: '' });
  const [files, setFiles] = useState([]);

  const locations = ['Lab 1','Lab 2','Lab 3','Lab 4','Lab 5','Hostel Block A','Hostel Block B','Hostel Block C','Hostel Block D','Hostel Block E','Hostel Block F','Off-campus'];

  useEffect(() => {
    fetchListings();
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/components/my-listings');
      setListings(data.data);
    } catch { }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category_id) return toast.error('Title and category are required');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { 
      if (v !== '' && v !== null) {
        if (k === 'tags' && typeof v === 'string') {
          const tagsArray = v.split(',').map(t => t.trim()).filter(Boolean);
          fd.append(k, JSON.stringify(tagsArray));
        } else {
          fd.append(k, v);
        }
      } 
    });
    files.forEach(f => fd.append('images', f));

    try {
      if (editId) {
        await api.put(`/components/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Listing updated');
      } else {
        await api.post('/components', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Component listed!');
      }
      setShowForm(false); setEditId(null); setFiles([]);
      setForm({ category_id: '', title: '', description: '', brand: '', model_number: '', condition: 'good', listing_type: 'lend', price_per_day: '', quantity: 1, tags: '', location: '', lab_name: '' });
      fetchListings();
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  const handleEdit = (comp) => {
    setEditId(comp.id);
    setForm({
      category_id: comp.category_id, title: comp.title, description: comp.description || '', brand: comp.brand || '',
      model_number: comp.model_number || '', condition: comp.condition, listing_type: comp.listing_type,
      price_per_day: comp.price_per_day || '', quantity: comp.quantity, tags: comp.tags?.join(', ') || '', location: comp.location || '', lab_name: comp.lab_name || ''
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/components/${deleteId}`);
      toast.success('Listing deleted');
      setDeleteId(null);
      fetchListings();
    } catch { toast.error('Failed to delete'); }
  };

  const statusBadge = { available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', reserved: 'bg-amber-100 text-amber-700', borrowed: 'bg-blue-100 text-blue-700', unavailable: 'bg-gray-100 text-gray-600' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ category_id: '', title: '', description: '', brand: '', model_number: '', condition: 'good', listing_type: 'lend', price_per_day: '', quantity: 1, tags: '', location: '', lab_name: '' }); }}
          className="btn-primary text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Listing</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div> :
        listings.length === 0 ? (
          <div className="text-center py-20 card">
            <Cpu className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No listings yet</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">List your first component to start sharing</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create Listing</button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-4 font-medium text-gray-500">Component</th>
                <th className="text-left p-4 font-medium text-gray-500 hidden sm:table-cell">Category</th>
                <th className="text-left p-4 font-medium text-gray-500 hidden md:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-gray-500 hidden md:table-cell">Views</th>
                <th className="text-right p-4 font-medium text-gray-500">Actions</th>
              </tr></thead>
              <tbody>
                {listings.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-4"><Link to={`/components/${c.id}`} className="font-medium hover:text-electric-500">{c.title}</Link></td>
                    <td className="p-4 text-gray-500 hidden sm:table-cell">{c.category_name}</td>
                    <td className="p-4 hidden md:table-cell"><span className={`badge ${statusBadge[c.status]}`}>{c.status}</span></td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">{c.views_count}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/components/${c.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg animate-fade-in mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editId ? 'Edit Listing' : 'New Listing'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field text-sm" placeholder="e.g. Arduino Uno R3" /></div>
              <div><label className="block text-sm font-medium mb-1">Category *</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="input-field text-sm">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-20 resize-none text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Brand</label><input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input-field text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Model</label><input value={form.model_number} onChange={e => setForm({...form, model_number: e.target.value})} className="input-field text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Condition</label>
                  <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="input-field text-sm">
                    <option value="new">New</option><option value="like_new">Like New</option><option value="good">Good</option><option value="fair">Fair</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Listing Type</label>
                  <select value={form.listing_type} onChange={e => setForm({...form, listing_type: e.target.value})} className="input-field text-sm">
                    <option value="lend">Lend</option><option value="rent">Rent</option><option value="trade">Trade</option><option value="giveaway">Giveaway</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Price/day (Rs)</label><input type="number" min="0" value={form.price_per_day} onChange={e => setForm({...form, price_per_day: e.target.value})} className="input-field text-sm" placeholder="0" /></div>
                <div><label className="block text-sm font-medium mb-1">Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Location</label>
                <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field text-sm">
                  <option value="">Select</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input-field text-sm" placeholder="arduino, sensor, iot" /></div>
              <div><label className="block text-sm font-medium mb-1">Images</label><input type="file" multiple accept="image/*" onChange={e => setFiles([...e.target.files])} className="input-field text-sm" /></div>
              <button type="submit" className="btn-primary w-full">{editId ? 'Update' : 'Create'} Listing</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Listing?</h3>
            <p className="text-sm text-gray-500 mb-5">This will also remove all associated borrow requests and reviews. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
