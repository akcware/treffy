import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buttonStyle, colors, cardStyle } from '../styles';
// @treffy/ui bağımlılığı kaldırıldı
import { iconPath } from '../assets-import';

function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  
  const startCall = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    navigate(`/call/${newRoomId}`);
  };
  
  const joinCall = () => {
    if (roomId.trim()) {
      navigate(`/call/${roomId.trim()}`);
    }
  };
  
  return (
    <div style={{ 
      padding: '20px',
      height: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      '-webkit-app-region': 'drag' // Ana sayfanın sürüklenebilir olmasını sağlar
    }}>
      <div style={{ 
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <img 
            src={iconPath} 
            alt="Treffy Logo" 
            style={{ height: '60px', marginRight: '15px' }} 
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 style={{ 
            fontSize: '42px', 
            color: '#000',
            letterSpacing: '-0.5px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>Treffy</h1>
        </div>
        <p style={{ 
          fontSize: '18px', 
          color: '#475569',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          marginBottom: '40px' 
        }}>
          Yüksek performanslı video konferans uygulaması
        </p>
        
        <div style={{
          ...cardStyle,
          marginBottom: '20px',
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Yeni Görüşme</h2>
          <button
            onClick={startCall}
            style={{
              ...buttonStyle('primary'),
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              borderRadius: '10px',
              background: '#000000',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              '-webkit-app-region': 'no-drag' // Butonun sürüklenebilir olmasını engeller
            }}
          >
            Görüşme Başlat
          </button>
        </div>
        
        <div style={{
          ...cardStyle,
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Mevcut Görüşmeye Katıl
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="roomId"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: colors.gray[700]
              }}
            >
              Oda ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Oda ID'sini girin"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `1px solid ${colors.gray[300]}`,
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease-in-out',
                ':focus': {
                  borderColor: '#000',
                  boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.15)'
                },
                '-webkit-app-region': 'no-drag' // Input alanının sürüklenebilir olmasını engeller
              }}
            />
          </div>
          
          <button
            onClick={joinCall}
            disabled={!roomId.trim()}
            style={{
              ...buttonStyle('primary', !roomId.trim()),
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              borderRadius: '10px',
              background: !roomId.trim() ? undefined : '#000000',
              boxShadow: !roomId.trim() ? undefined : '0 4px 14px rgba(0, 0, 0, 0.2)',
              '-webkit-app-region': 'no-drag' // Butonun sürüklenebilir olmasını engeller
            }}
          >
            Görüşmeye Katıl
          </button>
        </div>
        
        <div style={{ 
          marginTop: '24px',
          fontSize: '14px',
          color: 'rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
          textShadow: '0 1px 1px rgba(255, 255, 255, 0.2)'
        }}>
          <p>
            Treffy, yüksek kaliteli (1080p) video konferans uygulamasıdır.
            <br />
            Ekran paylaşımı, metin mesajlaşması ve dosya paylaşımı özellikleri içerir.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
