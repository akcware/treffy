import React, { useRef, useEffect, useState } from 'react';
import QualityIndicator from './QualityIndicator';

function VideoRenderer({ stream, muted = false, mirror = false, showQuality = false, isRemote = false }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  // Video oynatma/duraklatma
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Fareyle üzerine gelince kontrolleri göster
  const handleMouseEnter = () => {
    setShowControls(true);
  };
  
  const handleMouseLeave = () => {
    setShowControls(false);
  };
  
  useEffect(() => {
    if (!stream) {
      console.error('Stream bulunamadı');
      setError('Video akışı bulunamadı');
      return;
    }
    
    try {
      if (videoRef.current) {
        // Stream bilgilerini kontrol et
        console.log('Video akışı ayarlanıyor:', stream.id);
        console.log('Track sayısı:', stream.getTracks().length);
        console.log('Track türleri:', stream.getTracks().map(t => t.kind).join(', '));
        console.log('Track etkin mi:', stream.getTracks().map(t => t.enabled).join(', '));
        console.log('Track kısıtlandı mı:', stream.getTracks().map(t => t.muted).join(', '));
        
        // Önceki akışı temizle
        if (videoRef.current.srcObject) {
          console.log('Önceki akış temizleniyor');
          videoRef.current.srcObject = null;
        }
        
        // Yeni akışı ayarla
        videoRef.current.srcObject = stream;
        setError(null); // Herhangi bir hata varsa temizle
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video meta verileri yüklendi');
          videoRef.current.play().catch(e => {
            console.error('Video oynatma hatası:', e);
            setError('Video oynatılamadı: ' + e.message);
          });
          setHasStarted(true);
          setIsPlaying(true);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video hatası:', e);
          setError('Video yüklenirken hata oluştu');
        };
        
        // Oynama durumu değişikliğini dinle
        videoRef.current.onplay = () => setIsPlaying(true);
        videoRef.current.onpause = () => setIsPlaying(false);
      }
    } catch (err) {
      console.error('Video akışı ayarlama hatası:', err);
      setError('Video akışı ayarlanamadı: ' + err.message);
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        setHasStarted(false);
        setIsPlaying(false);
      }
    };
  }, [stream]);
  
  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <p>Video yüklenemedi</p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        data-remote={isRemote ? "true" : "false"}
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: 'black',
          transform: mirror ? 'scaleX(-1)' : 'none',
          '-webkit-app-region': 'drag', // Bu özellik pencereyi video üzerinden sürüklemeyi sağlar
          cursor: 'pointer'
        }}
      />
      
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          width: '100%',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          '-webkit-app-region': 'no-drag', // Kontroller sürüklenme alanı değil
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            gap: '16px'
          }}>
            <button 
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      
      {showQuality && hasStarted && (
        <QualityIndicator videoRef={videoRef} stream={stream} />
      )}
      
      {/* Video oynatılma durum göstergesi */}
      {!isPlaying && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '-webkit-app-region': 'no-drag'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default VideoRenderer;
