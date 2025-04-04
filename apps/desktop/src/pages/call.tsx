import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PeerConnection } from '@treffy/webrtc/peer/peer-connection';
import { SignalingClient } from '@treffy/webrtc/signaling/signaling-client';
import { CallControls } from '@treffy/ui/call-controls';
import { VideoRenderer } from '@treffy/ui/video-renderer';
import { getUserMedia, stopMediaStream, toggleAudio, toggleVideo } from '@treffy/webrtc/media/media-devices';
import { Button } from '@treffy/ui/button';
import { Copy } from 'lucide-react';

const CallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [userId] = useState(() => `user-${Math.random().toString(36).substring(2, 9)}`);
  
  const peerRef = useRef<PeerConnection | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  
  // Akışları başlat
  useEffect(() => {
    const initCall = async () => {
      if (!roomId) {
        navigate('/');
        return;
      }
      
      try {
        // Yerel medya akışını al
        const stream = await getUserMedia();
        if (stream) {
          setLocalStream(stream);
          
          // Sinyal sunucusuna bağlan
          const signaling = new SignalingClient('http://localhost:3001');
          signaling.connect(userId);
          
          signaling.onConnected(() => {
            console.log('Sinyal sunucusuna bağlanıldı');
            // Odaya katıl
            signaling.joinRoom(roomId);
            
            // Peer bağlantısını başlat
            const peer = new PeerConnection({
              initiator: true,
              stream,
            });
            
            peer.init();
            
            peer.onConnected(() => {
              console.log('Peer bağlantısı kuruldu');
              setConnectionState('connected');
            });
            
            peer.onDisconnected(() => {
              console.log('Peer bağlantısı koptu');
              setConnectionState('disconnected');
            });
            
            peer.onStream((remoteStream) => {
              console.log('Uzak akış alındı', remoteStream);
              setRemoteStream(remoteStream);
            });
            
            signalingRef.current = signaling;
            peerRef.current = peer;
            
            // Sinyal mesajlarını dinle
            signaling.onMessage((message) => {
              if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
                peer.signal(message.payload);
              }
            });
          });
        }
      } catch (error) {
        console.error('Görüşme başlatılamadı:', error);
      }
    };
    
    initCall();
    
    // Temizlik
    return () => {
      if (signalingRef.current) {
        signalingRef.current.disconnect();
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      
      if (localStream) {
        stopMediaStream(localStream);
      }
    };
  }, [roomId, userId, navigate]);
  
  const handleToggleMute = () => {
    if (localStream) {
      const success = toggleAudio(localStream, isMuted);
      if (success) {
        setIsMuted(!isMuted);
      }
    }
  };
  
  const handleToggleCamera = () => {
    if (localStream) {
      const success = toggleVideo(localStream, isCameraOff);
      if (success) {
        setIsCameraOff(!isCameraOff);
      }
    }
  };
  
  const handleToggleScreenShare = async () => {
    // Ekran paylaşımı işlevselliği
  };
  
  const handleHangup = () => {
    // Görüşmeyi sonlandır
    if (signalingRef.current && roomId) {
      signalingRef.current.leaveRoom(roomId);
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    
    if (localStream) {
      stopMediaStream(localStream);
    }
    
    navigate('/');
  };
  
  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call/${roomId}`);
    // Bildirim göster
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Görüşme: {roomId}</h1>
        
        <Button variant="outline" size="sm" onClick={copyRoomLink}>
          <Copy className="h-4 w-4 mr-2" />
          Davet Linki Kopyala
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col p-4 bg-muted">
        <div className="w-full flex-1 relative bg-black rounded-lg overflow-hidden">
          {/* Ana video (uzak veya kendi) */}
          <VideoRenderer 
            stream={remoteStream || localStream} 
            muted={!remoteStream} 
            className="w-full h-full object-cover"
            fallback={
              <div className="flex items-center justify-center h-full text-white">
                <p>Görüntü yok</p>
              </div>
            }
          />
          
          {/* PiP (kendi görüntüsü) */}
          {remoteStream && (
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[240px] aspect-video">
              <VideoRenderer 
                stream={localStream} 
                muted={true} 
                mirror={true}
                className="w-full h-full object-cover rounded-lg border-2 border-white"
              />
            </div>
          )}
          
          {/* Bağlantı durumu */}
          {connectionState !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-center">
                <p className="text-xl mb-2">
                  {connectionState === 'new' && 'Görüşme başlatılıyor...'}
                  {connectionState === 'connecting' && 'Bağlanıyor...'}
                  {connectionState === 'disconnected' && 'Bağlantı kesildi'}
                  {connectionState === 'failed' && 'Bağlantı kurulamadı'}
                </p>
                
                {(connectionState === 'disconnected' || connectionState === 'failed') && (
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Ana Sayfaya Dön
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex justify-center">
        <CallControls 
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onHangup={handleHangup}
        />
      </div>
    </div>
  );
};

export default CallPage;