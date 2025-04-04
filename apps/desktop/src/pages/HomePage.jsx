import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buttonStyle, colors, cardStyle } from '../styles';

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
      backgroundColor: colors.gray[50],
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
        <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Treffy</h1>
        <p style={{ 
          fontSize: '18px', 
          color: colors.gray[600],
          marginBottom: '40px' 
        }}>
          Yüksek performanslı video konferans uygulaması
        </p>
        
        <div style={{
          ...cardStyle,
          marginBottom: '20px',
          textAlign: 'center',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Yeni Görüşme</h2>
          <button
            onClick={startCall}
            style={{
              ...buttonStyle('primary'),
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              '-webkit-app-region': 'no-drag' // Butonun sürüklenebilir olmasını engeller
            }}
          >
            Görüşme Başlat
          </button>
        </div>
        
        <div style={{
          ...cardStyle,
          textAlign: 'left'
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
                borderRadius: '8px',
                border: `1px solid ${colors.gray[300]}`,
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
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
              '-webkit-app-region': 'no-drag' // Butonun sürüklenebilir olmasını engeller
            }}
          >
            Görüşmeye Katıl
          </button>
        </div>
        
        <div style={{ 
          marginTop: '24px',
          fontSize: '14px',
          color: colors.gray[500],
          textAlign: 'center'
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
