import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, HardHat, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={20} /> },
  { label: 'Sites', path: '/sites', icon: <Building2 size={20} /> },
  { label: 'Workers', path: '/workers', icon: <Users size={20} /> },
];

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.path)
              ? 'bg-amber-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center gap-3 px-4 py-4 mb-6">
          <HardHat size={28} className="text-amber-500" />
          <span className="text-xl font-bold tracking-tight">SiteManager</span>
        </div>
        {navLinks}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-gray-900 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <HardHat size={24} className="text-amber-500" />
          <span className="text-lg font-bold tracking-tight">SiteManager</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-900 text-white pt-16 px-4">
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {navLinks}
        </div>
      )}
    </>
  );
}

export default Sidebar;
