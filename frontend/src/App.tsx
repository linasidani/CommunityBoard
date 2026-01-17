import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { PostList } from './components/PostList';

function MainApp() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      <PostList />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;