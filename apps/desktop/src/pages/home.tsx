import { useNavigate } from 'react-router-dom';
import { Video, Settings, Users } from 'lucide-react';
import { Button } from '@treffy/ui/button';

const HomePage = () => {
  const navigate = useNavigate();

  const startCall = () => {
    // Rastgele bir oda ID'si oluştur
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/call/${roomId}`);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Treffy</h1>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-center mb-6">
          <p className="text-xl mb-2">Hoş Geldiniz</p>
          <p className="text-muted-foreground">Yüksek kaliteli video görüşmeleri için Treffy'yi tercih ettiğiniz için teşekkürler.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={startCall}
          >
            <Video className="h-6 w-6" />
            <span>Görüşme Başlat</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/contacts')}
          >
            <Users className="h-6 w-6" />
            <span>Kişiler</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-6 w-6" />
            <span>Ayarlar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;