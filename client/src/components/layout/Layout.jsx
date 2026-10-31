import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>ComponentHub © {new Date().getFullYear()} — P2P Component Exchange for Engineering Students</p>
          <p className="mt-1">Built by Senuk Yuthmika · EC4307 Web Application Development</p>
        </div>
      </footer>
    </div>
  );
}
