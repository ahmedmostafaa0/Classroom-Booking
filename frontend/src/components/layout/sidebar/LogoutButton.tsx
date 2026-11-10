
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  return (
    <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
      <button
        onClick={onLogout}
        className="flex items-center space-x-2 w-full px-3 py-2 text-left rounded-md hover:bg-slate-100"
      >
        <LogOut className="h-5 w-5 text-red-500" />
        <span>Logout</span>
      </button>
    </div>
  );
};
