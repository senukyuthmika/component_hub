import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Search, Repeat, Shield } from 'lucide-react';
import api from '../services/api';
import ComponentImage from '../components/ComponentImage';

function Counter({ end, label }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => { start += step; if (start >= end) { setVal(end); clearInterval(timer); } else setVal(start); }, 30);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-white animate-count">{val}+</div>
      <div className="text-sm text-electric-200 mt-1">{label}</div>
    </div>
  );
}

export default function Landing() {
  const [stats, setStats] = useState({ totalComponents: 0, totalUsers: 0, totalBorrowed: 0 });
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/components?limit=6&sort=views&order=desc').then(r => setFeatured(r.data.data.components)).catch(() => {});
  }, []);

  const steps = [
    { icon: Search, title: 'Find Components', desc: 'Browse through hundreds of electronic components listed by students across campus.' },
    { icon: Repeat, title: 'Request to Borrow', desc: 'Send a borrow request with your project details. The owner reviews and approves.' },
    { icon: Shield, title: 'Build & Return', desc: 'Use the component for your project, then return it. Leave a review for others.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10b981 0%, transparent 50%)'
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='0.5'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='60' cy='0' r='2'/%3E%3Ccircle cx='0' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-300 text-sm mb-6">
              <Zap className="w-3.5 h-3.5" /> Campus Component Sharing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Share components.<br />Build projects<span className="text-electric-400">.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-300 max-w-xl leading-relaxed">
              Stop buying components you'll use once. ComponentHub connects engineering students to share, lend, rent, and trade electronic parts across campus.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-7 py-3">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/browse" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-7 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10">
                Browse Components
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md">
            <Counter end={stats.totalComponents || 80} label="Components" />
            <Counter end={stats.totalUsers || 25} label="Users" />
            <Counter end={stats.totalBorrowed || 40} label="Borrowed" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How ComponentHub works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-electric-50 dark:bg-electric-900/20 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-7 h-7 text-electric-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-navy-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Popular listings</h2>
              <Link to="/browse" className="text-electric-500 text-sm font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(c => (
                <Link key={c.id} to={`/components/${c.id}`} className="card p-4 hover:shadow-md transition-shadow group">
                  <ComponentImage component={c} className="h-40 rounded-xl mb-3 group-hover:scale-[1.02] transition-transform" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{c.category_name}</p>
                    </div>
                    <span className={`badge ${c.status === 'available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>{c.location}</span>
                    {c.price_per_day && <span className="font-medium text-gray-700 dark:text-gray-300">Rs.{c.price_per_day}/day</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-navy-950">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to start sharing?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join your campus network and never buy a one-time component again.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Create Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
