import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validering
    if (!isLogin) {
      if (username.length < 3) {
        setError('Användarnamn måste vara minst 3 tecken');
        return;
      }
      if (password.length < 6) {
        setError('Lösenord måste vara minst 6 tecken');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ username, email, password });
      }
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isLogin ? 'Logga in' : 'Registrera'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Användarnamn (minst 3 tecken)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={3}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lösenord {!isLogin && '(minst 6 tecken)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Laddar...' : isLogin ? 'Logga in' : 'Registrera'}
          </button>
        </form>

        {/* Toggle between login/register */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? 'Har du inget konto?' : 'Har du redan ett konto?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:underline ml-1"
          >
            {isLogin ? 'Registrera här' : 'Logga in här'}
          </button>
        </div>

        {/* Test credentials hint */}
        {isLogin && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
            <strong>Tips:</strong> Skapa ett nytt konto om du glömt lösenordet!
          </div>
        )}
      </div>
    </div>
  );
};