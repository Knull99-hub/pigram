import { NavLink } from 'react-router-dom';
import { Home, Search, Compass, Heart, PlusSquare, User, Bookmark } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function MobileNav() {
  const { user } = useAuthStore();

  const item = (to: string, Icon: React.ElementType) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center p-3 ${isActive ? 'text-gray-900' : 'text-gray-500'}`
      }
    >
      <Icon size={24} />
    </NavLink>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around z-30">
      {item('/', Home)}
      {item('/search', Search)}
      {item('/discover', Compass)}
      {item('/notifications', Heart)}
      {user?.role === 'creator' && item('/create', PlusSquare)}
      {item('/saved', Bookmark)}
      {user && item(`/profile/${user.username}`, User)}
    </nav>
  );
}
