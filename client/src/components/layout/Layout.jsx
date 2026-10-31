import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-navy-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!isLanding && (
        <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto bg-gray-50 dark:bg-navy-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>ComponentHub © {new Date().getFullYear()} — P2P Component Exchange & Lab Inventory for Engineering Students</p>
            <p className="mt-1">Built by Senuk Yuthmika · EC4307 Web Application Development</p>
          </div>
        </footer>
      )}
    </div>
  );
}
