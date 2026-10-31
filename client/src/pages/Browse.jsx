import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, MapPin, Eye, Cpu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ComponentImage from '../components/ComponentImage';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [autocomplete, setAutocomplete] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    listing_type: searchParams.get('listing_type') || '',
    location: searchParams.get('location') || '',
    status: searchParams.get('status') || 'available',
    sort: searchParams.get('sort') || 'date',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [filters]);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await api.get('/components', { params });
      setComponents(data.data.components);
      setPagination(data.data.pagination);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSearch = (val) => {
    setFilters(f => ({ ...f, search: val, page: 1 }));
    if (val.length >= 2) {
      api.get(`/components/autocomplete?q=${val}`).then(r => setAutocomplete(r.data.data)).catch(() => {});
    } else setAutocomplete([]);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', condition: '', listing_type: '', location: '', status: '', sort: 'date', order: 'desc', page: 1 });
  };

  const locations = ['Lab 1','Lab 2','Lab 3','Lab 4','Lab 5','Hostel Block A','Hostel Block B','Hostel Block C','Hostel Block D','Off-campus'];
  const hasFilters = filters.category || filters.condition || filters.listing_type || filters.location;

  const statusDot = (s) => s === 'available' ? 'bg-emerald-400' : s === 'reserved' ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Browse Components</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} components available</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-electric-50 text-electric-600 dark:bg-electric-900/30' : 'text-gray-400'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-electric-50 text-electric-600 dark:bg-electric-900/30' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm flex items-center gap-1.5 md:hidden"><Filter className="w-4 h-4" /> Filters</button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 flex' : 'hidden'} md:block md:relative md:inset-auto md:bg-transparent md:z-auto`}>
          <div className={`${showFilters ? 'w-80 bg-white dark:bg-navy-900 h-full overflow-y-auto p-5' : ''} md:w-60 shrink-0 space-y-5`}>
            {showFilters && <div className="flex items-center justify-between md:hidden"><h3 className="font-semibold">Filters</h3><button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button></div>}

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              {categories.map(c => (
                <label key={c.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                  <input type="radio" name="cat" checked={filters.category == c.id} onChange={() => setFilters(f => ({...f, category: f.category == c.id ? '' : c.id, page: 1}))} className="accent-electric-500" />
                  <span>{c.icon} {c.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{c.component_count}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <select value={filters.condition} onChange={e => setFilters(f => ({...f, condition: e.target.value, page: 1}))} className="input-field text-sm">
                <option value="">All conditions</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Listing Type</label>
              <select value={filters.listing_type} onChange={e => setFilters(f => ({...f, listing_type: e.target.value, page: 1}))} className="input-field text-sm">
                <option value="">All types</option>
                <option value="lend">Lend</option>
                <option value="rent">Rent</option>
                <option value="trade">Trade</option>
                <option value="giveaway">Giveaway</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select value={filters.location} onChange={e => setFilters(f => ({...f, location: e.target.value, page: 1}))} className="input-field text-sm">
                <option value="">All locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {hasFilters && <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear all filters</button>}
          </div>
          {showFilters && <div className="flex-1 md:hidden" onClick={() => setShowFilters(false)} />}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={filters.search} onChange={e => handleSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search components, brands, models..." />
            {autocomplete.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 card shadow-lg p-1 z-10 max-h-48 overflow-y-auto">
                {autocomplete.map(a => (
                  <button key={a.id} onClick={() => { setFilters(f => ({...f, search: a.title})); setAutocomplete([]); }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 truncate">
                    {a.title} {a.brand && <span className="text-gray-400">— {a.brand}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">Sort:</span>
            {[{ val: 'date', label: 'Newest' }, { val: 'price', label: 'Price' }, { val: 'views', label: 'Popular' }].map(s => (
              <button key={s.val} onClick={() => setFilters(f => ({...f, sort: s.val, order: f.sort === s.val && f.order === 'desc' ? 'asc' : 'desc'}))}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${filters.sort === s.val ? 'bg-electric-50 text-electric-600 dark:bg-electric-900/30 font-medium' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className={`grid ${view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64" />)}
            </div>
          ) : components.length === 0 ? (
            <div className="text-center py-20">
              <Cpu className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No components found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {components.map(c => (
                <Link key={c.id} to={`/components/${c.id}`} className="card p-4 hover:shadow-md transition-all group">
                  <ComponentImage component={c} className="h-36 rounded-xl mb-3 group-hover:scale-[1.02] transition-transform" />
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate flex-1">{c.title}</h3>
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${statusDot(c.status)}`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{c.category_name}</span>
                    <span className="capitalize">{c.condition?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-400"><MapPin className="w-3 h-3" />{c.location}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-0.5 text-gray-400"><Eye className="w-3 h-3" />{c.views_count}</span>
                      {c.price_per_day > 0 && <span className="font-semibold text-gray-700 dark:text-gray-200">Rs.{c.price_per_day}/d</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {components.map(c => (
                <Link key={c.id} to={`/components/${c.id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <ComponentImage component={c} className="w-16 h-16 rounded-xl shrink-0" imgClassName="w-full h-full object-contain p-1.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{c.category_name} · {c.condition?.replace('_', ' ')} · {c.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`w-2 h-2 rounded-full inline-block ${statusDot(c.status)}`} />
                    {c.price_per_day > 0 && <p className="text-sm font-semibold mt-1">Rs.{c.price_per_day}/d</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setFilters(f => ({...f, page: f.page - 1}))} disabled={filters.page <= 1}
                className="btn-secondary text-sm p-2 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => setFilters(f => ({...f, page: f.page + 1}))} disabled={filters.page >= pagination.pages}
                className="btn-secondary text-sm p-2 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
