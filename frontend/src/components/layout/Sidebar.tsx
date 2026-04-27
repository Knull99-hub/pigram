import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Compass, Heart, PlusSquare, User, Bookmark, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (to: string, Icon: React.ElementType, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 ${isActive ? 'font-semibold' : ''}`
      }
    >
      <Icon size={24} />
      <span className="hidden lg:block">{label}</span>
    </NavLink>
  );

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-16 lg:w-64 border-r border-gray-200 bg-white px-3 py-6 z-30">
      <Link to="/" className="px-3 mb-8 block">
        <span className="hidden lg:block text-2xl font-bold tracking-tight">Pixgram</span>
        <span className="lg:hidden text-2xl">📷</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItem('/', Home, 'Home')}
        {navItem('/search', Search, 'Search')}
        {navItem('/discover', Compass, 'Explore')}
        {navItem('/notifications', Heart, 'Notifications')}
        {user?.role === 'creator' && navItem('/create', PlusSquare, 'Create')}
        {navItem('/saved', Bookmark, 'Saved')}
        {user && navItem(`/profile/${user.username}`, User, 'Profile')}
      </nav>

      <div className="mt-auto">
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
            <LogOut size={24} className="text-gray-700" />
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-400">Log out</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
