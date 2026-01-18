import { Home, User, LogOut, LogIn, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar = ({ onLoginClick }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Home size={24} aria-hidden="true" />
            <h1 className="text-xl font-bold">Digital Anslagstavla</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-blue-500 dark:hover:bg-gray-700 transition"
              aria-label={isDarkMode ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
              title={isDarkMode ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User section */}
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <User size={20} aria-hidden="true" />
                  <span className="font-medium">{user?.username}</span>
                  {user?.role === 'Admin' && (
                    <span className="bg-yellow-500 text-xs px-2 py-1 rounded" role="status">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                  aria-label="Logga ut"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Logga ut
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
                aria-label="Logga in"
              >
                <LogIn size={18} aria-hidden="true" />
                Logga in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};