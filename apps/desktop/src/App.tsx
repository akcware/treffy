import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@treffy/ui/theme-provider';
import HomePage from './pages/home';
import CallPage from './pages/call';
import SettingsPage from './pages/settings';
import ContactsPage from './pages/contacts';
import TitleBar from './components/titlebar';

const App = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Uygulama başlangıç işlemleri
    const initApp = async () => {
      try {
        // Kullanıcı ayarlarını yükle
        // Kullanıcı oturumunu kontrol et
        // Diğer başlangıç işlemleri
        
        setLoading(false);
      } catch (error) {
        console.error('Uygulama başlatılamadı:', error);
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xl">Treffy yükleniyor...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="treffy-theme">
      <div className="flex flex-col h-full">
        <TitleBar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/call/:roomId?" element={<CallPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;