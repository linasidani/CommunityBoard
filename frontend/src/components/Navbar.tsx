import { Home, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar = ({ onLoginClick }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home size={24} />
            <h1 className="text-xl font-bold">Digital Anslagstavla</h1>
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <span className="font-medium">{user?.username}</span>
                  {user?.role === 'Admin' && (
                    <span className="bg-yellow-500 text-xs px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  <LogOut size={18} />
                  Logga ut
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
              >
                <LogIn size={18} />
                Logga in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};