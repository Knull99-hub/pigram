import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-16 lg:ml-64 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
