import * as React from "react";
import { cn } from "./utils";

interface VideoRendererProps {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

export const VideoRenderer = React.forwardRef<HTMLVideoElement, VideoRendererProps>(
  ({ stream, muted = false, mirror = false, className, fallback, ...props }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLVideoElement>) || videoRef;

    React.useEffect(() => {
      if (resolvedRef.current && stream) {
        resolvedRef.current.srcObject = stream;
      }
      return () => {
        if (resolvedRef.current) {
          resolvedRef.current.srcObject = null;
        }
      };
    }, [stream, resolvedRef]);

    if (!stream && fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <video
        ref={resolvedRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          "w-full h-full object-cover bg-black",
          mirror && "scale-x-[-1]",
          className
        )}
        {...props}
      />
    );
  }
);

VideoRenderer.displayName = "VideoRenderer";