import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, X, Sun, Moon, Bell, Heart, MessageSquare, ChevronDown, 
  LogOut, User, LayoutDashboard, Settings, Shield, Search, Phone, 
  ShoppingBag, Sparkles, Cpu, Zap
} from 'lucide-react';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => setUnread(r.data.data.unreadCount)).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isLanding = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-[#07131F]/95 backdrop-blur-xl border-b border-white/10 text-white transition-colors duration-200">
      <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo with Green Hexagon */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(0,194,111,0.5)] transition-transform group-hover:scale-105">
                <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
              </svg>
              <div className="relative z-10 text-white flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block">
                ComponentHub
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wider uppercase font-medium hidden 2xl:block whitespace-nowrap">Component Exchange & Lab Inventory</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            {isLanding ? (
              <>
                <a href="#hero" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-emerald-400 hover:text-white transition-colors">Home</a>
                <a href="#about" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors">About</a>
                <a href="#categories" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors">Categories</a>
                <a href="#how-it-works" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors hidden xl:inline-block">How It Works</a>
                <a href="#inventory" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors">Inventory</a>
                <a href="#reviews" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors hidden xl:inline-block">Reviews</a>
                <a href="#contact" className="whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white transition-colors">Lab Desk</a>
                <Link to="/browse" className="whitespace-nowrap ml-0.5 xl:ml-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-[#00C26F] hover:text-white hover:bg-[#00C26F]/20 border border-[#00C26F]/40 flex items-center gap-1.5 transition-all shrink-0">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> Browse Catalog
                </Link>
              </>
            ) : (
              user ? (
                [
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/browse', label: 'Browse' },
                  { to: '/my-listings', label: 'My Listings' },
                  { to: '/requests', label: 'Requests' },
                ].map(l => (
                  <Link key={l.to} to={l.to}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                      isActive(l.to) ? 'bg-[#00C26F]/20 text-[#00C26F] border border-[#00C26F]/30' : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}>{l.label}</Link>
                ))
              ) : (
                <>
                  <Link to="/" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white">Home</Link>
                  <Link to="/browse" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-gray-300 hover:text-white">Browse Components</Link>
                </>
              )
            )}
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Phone Call Helpdesk Pill (Sri Lankan engineering lab extension) */}
            <a href="tel:0771234567" className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00C26F]/50 transition-all text-xs text-gray-300 group shrink-0">
              <div className="w-6 h-6 rounded-full bg-[#00C26F] flex items-center justify-center text-[#07131F] font-bold group-hover:scale-110 transition-transform shrink-0">
                <Phone className="w-3 h-3 text-[#07131F]" />
              </div>
              <div className="text-left whitespace-nowrap">
                <p className="text-[10px] text-gray-400 uppercase font-semibold leading-none">Lab Helpdesk</p>
                <p className="text-xs font-bold text-white tracking-wide leading-tight">077-1234567</p>
              </div>
            </a>

            {/* Quick Search */}
            <Link to="/browse" title="Search Components" className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0">
              <Search className="w-4 h-4" />
            </Link>

            {/* Wishlist / Saved Items */}
            <Link to="/wishlist" title="Saved Components" className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors relative shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </Link>

            {/* Theme Toggle */}
            <button onClick={toggle} title="Toggle Theme" className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0">
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-300" />}
            </button>

            {user ? (
              <>
                <Link to="/messages" className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors hidden sm:flex">
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <Link to="/notifications" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  <Bell className="w-4 h-4" />
                  {unread > 0 && <span className="absolute 1 top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C26F] to-emerald-700 flex items-center justify-center text-white text-sm font-semibold shadow-inner">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-[#0E243A] border border-white/10 rounded-xl p-2 shadow-2xl z-50 text-white animate-fade-in">
                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                          <p className="font-semibold text-sm truncate text-white">{user.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-gray-200"><User className="w-4 h-4 text-[#00C26F]" /> Profile</Link>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-gray-200"><LayoutDashboard className="w-4 h-4 text-[#00C26F]" /> Dashboard</Link>
                        {user.role === 'superadmin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-gray-200"><Shield className="w-4 h-4 text-[#00C26F]" /> Admin Panel</Link>}
                        <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-500/20 text-red-400 w-full mt-1"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link to="/login" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors shrink-0">Sign In</Link>
                <Link to="/register" className="whitespace-nowrap bg-[#00C26F] hover:bg-[#00D87B] text-white font-semibold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg hidden sm:inline-flex items-center gap-1 shadow-md shadow-[#00C26F]/20 transition-all duration-200 active:scale-[0.98] shrink-0">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#07131F] p-4 animate-fade-in space-y-2">
          {isLanding ? (
            <>
              <a href="#hero" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-white/5">Home</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">About</a>
              <a href="#categories" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">Categories</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">How It Works</a>
              <a href="#inventory" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">Inventory</a>
              <a href="#reviews" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">Reviews</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">Lab Desk</a>
              <Link to="/browse" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-[#00C26F] hover:bg-white/5 font-semibold">Browse All Components</Link>
            </>
          ) : (
            user ? (
              [
                { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/browse', label: 'Browse Catalog', icon: Search },
                { to: '/my-listings', label: 'My Listings', icon: Settings },
                { to: '/requests', label: 'Borrow Requests', icon: MessageSquare },
                { to: '/wishlist', label: 'Wishlist', icon: Heart },
                { to: '/messages', label: 'Messages', icon: MessageSquare },
              ].map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">
                  <l.icon className="w-4 h-4 text-[#00C26F]" /> {l.label}
                </Link>
              ))
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-white/10">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-[#00C26F]">Create Account</Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
