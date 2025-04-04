// Video kalitesi ayarları
export const videoQualities = {
  sd: {
    label: 'SD',
    description: '480p',
    constraints: {
      width: { ideal: 854 },
      height: { ideal: 480 },
      frameRate: { ideal: 24 }
    }
  },
  hd: {
    label: 'HD',
    description: '720p',
    constraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  },
  fhd: {
    label: 'FHD',
    description: '1080p',
    constraints: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
    }
  },
  max: {
    label: 'MAX',
    description: 'Limitsiz',
    constraints: {
      width: { ideal: 3840 },
      height: { ideal: 2160 },
      frameRate: { ideal: 60 }
    }
  }
};

// Aktif görüntünün kalitesini analiz et
export function analyzeVideoQuality(videoElement) {
  if (!videoElement) return 'unknown';
  
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;
  
  if (width >= 1920 && height >= 1080) {
    return 'fhd';
  } else if (width >= 1280 && height >= 720) {
    return 'hd';
  } else if (width >= 854 && height >= 480) {
    return 'sd';
  } else {
    return 'sd'; // Varsayılan olarak SD
  }
}

// Video stream'ini belirli kaliteye ayarla
export async function setVideoQuality(stream, quality) {
  if (!stream) return null;
  
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return stream;
  
  try {
    const constraints = videoQualities[quality].constraints;
    await videoTrack.applyConstraints(constraints);
    return stream;
  } catch (error) {
    console.error('Video kalitesi ayarlanamadı:', error);
    return stream;
  }
}

// Mevcut görüntünün boyutlarını al
export function getVideoResolution(videoElement) {
  if (!videoElement) return { width: 0, height: 0 };
  
  return {
    width: videoElement.videoWidth,
    height: videoElement.videoHeight
  };
}

// Görüntünün gerçek çözünürlüğünü etiketle
export function getQualityLabel(videoElement) {
  if (!videoElement) return 'Bilinmiyor';
  
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;
  
  if (width >= 3000 || height >= 2000) {
    return 'MAX';
  } else if (width >= 1920 && height >= 1080) {
    return 'FHD';
  } else if (width >= 1280 && height >= 720) {
    return 'HD';
  } else if (width >= 854 && height >= 480) {
    return 'SD';
  } else {
    return 'SD';
  }
}
