import { useState, useEffect } from 'react';
import { Button } from '@treffy/ui/button';
import { getMediaDevices } from '@treffy/webrtc/media/media-devices';

const SettingsPage = () => {
  const [audioInputs, setAudioInputs] = useState<{ deviceId: string; label: string; }[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<{ deviceId: string; label: string; }[]>([]);
  const [videoInputs, setVideoInputs] = useState<{ deviceId: string; label: string; }[]>([]);
  
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  
  useEffect(() => {
    const loadDevices = async () => {
      const devices = await getMediaDevices();
      setAudioInputs(devices.audioInputs);
      setAudioOutputs(devices.audioOutputs);
      setVideoInputs(devices.videoInputs);
      
      // Kayıtlı ayarları yükle
      if (window.electron) {
        const settings = await window.electron.getSettings('callSettings');
        if (settings) {
          setSelectedAudioInput(settings.preferredAudioInput || '');
          setSelectedAudioOutput(settings.preferredAudioOutput || '');
          setSelectedVideoInput(settings.preferredVideoInput || '');
        }
      }
    };
    
    loadDevices();
  }, []);
  
  const saveSettings = async () => {
    if (window.electron) {
      await window.electron.setSettings('callSettings', {
        preferredAudioInput: selectedAudioInput,
        preferredAudioOutput: selectedAudioOutput,
        preferredVideoInput: selectedVideoInput,
      });
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-semibold mb-4">Görüşme Ayarları</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Mikrofon</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedAudioInput}
                onChange={(e) => setSelectedAudioInput(e.target.value)}
              >
                <option value="">Varsayılan</option>
                {audioInputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Hoparlör</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedAudioOutput}
                onChange={(e) => setSelectedAudioOutput(e.target.value)}
              >
                <option value="">Varsayılan</option>
                {audioOutputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Kamera</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={selectedVideoInput}
                onChange={(e) => setSelectedVideoInput(e.target.value)}
              >
                <option value="">Varsayılan</option>
                {videoInputs.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Uygulama Bilgileri</h2>
          
          <div className="bg-muted p-4 rounded-md">
            <p>Treffy v0.1.0</p>
            <p className="text-muted-foreground mt-1">Yüksek performanslı video konferans uygulaması</p>
          </div>
        </div>
        
        <div className="pt-4">
          <Button onClick={saveSettings}>Ayarları Kaydet</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;