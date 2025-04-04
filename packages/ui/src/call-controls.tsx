import * as React from "react";
import { Button } from "./button";
import { cn } from "./utils";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  MonitorOff,
  Settings,
} from "lucide-react";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onHangup: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export function CallControls({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onHangup,
  onOpenSettings,
  className,
}: CallControlsProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-4", className)}>
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleMute}
        aria-label={isMuted ? "Mikrofonu Aç" : "Mikrofonu Kapat"}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </Button>

      <Button
        variant={isCameraOff ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleCamera}
        aria-label={isCameraOff ? "Kamerayı Aç" : "Kamerayı Kapat"}
      >
        {isCameraOff ? <VideoOff /> : <Video />}
      </Button>

      <Button
        variant={isScreenSharing ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleScreenShare}
        aria-label={isScreenSharing ? "Ekran Paylaşımını Durdur" : "Ekranı Paylaş"}
      >
        {isScreenSharing ? <MonitorOff /> : <ScreenShare />}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        onClick={onHangup}
        aria-label="Görüşmeyi Sonlandır"
      >
        <PhoneOff />
      </Button>

      {onOpenSettings && (
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Ayarlar"
        >
          <Settings />
        </Button>
      )}
    </div>
  );
}
