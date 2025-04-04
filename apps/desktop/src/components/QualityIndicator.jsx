import React, { useState, useEffect, useRef } from 'react';
import { getQualityLabel } from '../utils/video-quality';
import { badgeStyle } from '../styles';

const QualityIndicator = ({ videoRef, stream }) => {
  const [quality, setQuality] = useState('Bağlanıyor...');
  const [variant, setVariant] = useState('gray');
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (!videoRef.current || !stream) return;
    
    // Her 2 saniyede bir kaliteyi güncelle
    intervalRef.current = setInterval(() => {
      if (videoRef.current) {
        const qualityLabel = getQualityLabel(videoRef.current);
        setQuality(qualityLabel);
        
        // Kalite etiketine göre badge rengi belirle
        if (qualityLabel.includes('1080p')) {
          setVariant('success');
        } else if (qualityLabel.includes('720p')) {
          setVariant('primary');
        } else if (qualityLabel.includes('360p')) {
          setVariant('warning');
        } else {
          setVariant('gray');
        }
      }
    }, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoRef, stream]);
  
  // Özel bulanık arka plan stil nesnesi - badgeStyle yerine kendi stilimizi oluşturalım
  const getBadgeStyle = (variant) => {
    // Renk tanımları
    const colors = {
      success: { bg: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
      primary: { bg: 'rgba(79, 70, 229, 0.3)', text: '#4f46e5' },
      warning: { bg: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
      danger: { bg: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
      gray: { bg: 'rgba(100, 116, 139, 0.3)', text: '#64748b' }
    };
    
    const selectedColor = colors[variant] || colors.gray;
    
    return {
      backgroundColor: selectedColor.bg,
      color: selectedColor.text,
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${selectedColor.text}20` // 20 = 12% transparency
    };
  };

  return (
    <div style={{
      position: 'absolute',
      top: process.platform === 'darwin' ? '70px' : '10px', // MacOS için daha fazla üst boşluk
      left: '10px',
      zIndex: 10,
      ...getBadgeStyle(variant),
      '-webkit-app-region': 'no-drag'
    }}>
      {quality}
    </div>
  );
};

export default QualityIndicator;
