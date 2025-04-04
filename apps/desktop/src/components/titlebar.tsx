import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Square, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '@treffy/ui/theme-provider';

const TitleBar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [maximized, setMaximized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Pencere durumunu kontrol et
  useEffect(() => {
    // Electron API'si kullanılabilirse
    if (window.electron) {
      // Maksimize durumunu dinle
    }
  }, []);

  const handleMinimize = () => {
    // Electron API'si kullanılabilirse
    if (window.electron) {
      // Pencereyi küçült
    }
  };

  const handleMaximize = () => {
    // Electron API'si kullanılabilirse
    if (window.electron) {
      // Pencereyi büyüt/küçült
      setMaximized(!maximized);
    }
  };

  const handleClose = () => {
    // Electron API'si kullanılabilirse
    if (window.electron) {
      // Pencereyi kapat
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="titlebar flex items-center justify-between bg-background border-b h-10 px-2">
      <div className="flex items-center no-drag">
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="p-2 rounded-md hover:bg-secondary"
        >
          <Menu size={16} />
        </button>
        
        {menuOpen && (
          <div className="absolute top-10 left-2 bg-popover shadow-md rounded-md py-1 z-50">
            <button 
              onClick={() => { navigate('/'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-secondary"
            >
              Ana Sayfa
            </button>
            <button 
              onClick={() => { navigate('/contacts'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-secondary"
            >
              Kişiler
            </button>
            <button 
              onClick={() => { navigate('/settings'); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-secondary"
            >
              Ayarlar
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 text-center text-sm font-medium">Treffy</div>
      
      <div className="flex items-center no-drag">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-md hover:bg-secondary"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <button 
          onClick={handleMinimize} 
          className="p-2 rounded-md hover:bg-secondary"
        >
          <Minus size={16} />
        </button>
        
        <button 
          onClick={handleMaximize} 
          className="p-2 rounded-md hover:bg-secondary"
        >
          <Square size={16} />
        </button>
        
        <button 
          onClick={handleClose} 
          className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;