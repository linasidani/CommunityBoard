import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { DarkModeProvider } from './hooks/useDarkMode';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { PostList } from './components/PostList';

function MainApp() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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
    <DarkModeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;