
import { useAuth } from '@/contexts/AuthContext';
import { PublicNavLinks } from './PublicNavLinks';
import { UserNavLinks } from './UserNavLinks';
import { AdminNavLinks } from './AdminNavLinks';

interface SidebarNavLinksProps {
  isActive: (path: string) => boolean;
}

export const SidebarNavLinks = ({ isActive }: SidebarNavLinksProps) => {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
      {!user ? (
        <PublicNavLinks isActive={isActive} />
      ) : (
        <>
          <UserNavLinks isActive={isActive} />
          {isAdmin && <AdminNavLinks isActive={isActive} />}
        </>
      )}
    </nav>
  );
};
