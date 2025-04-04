"use client"

import { useState, useEffect } from 'react'
import { Camera, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'

export default function CallPage() {
  const [micActive, setMicActive] = useState(true)
  const [cameraActive, setCameraActive] = useState(true)
  
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-4xl aspect-video bg-black rounded-lg relative overflow-hidden mb-4">
          {/* Video alanı */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white">Video görüntüsü burada gösterilecek</p>
          </div>
          
          {/* PiP görüntüsü */}
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg border-2 border-white">
            <div className="flex items-center justify-center h-full">
              <p className="text-white text-sm">Kullanıcı görüntüsü</p>
            </div>
          </div>
        </div>
        
        {/* Kontrol butonları */}
        <div className="flex space-x-4">
          <button 
            onClick={() => setMicActive(!micActive)}
            className={`p-4 rounded-full ${micActive ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {micActive ? <Mic /> : <MicOff />}
          </button>
          
          <button 
            onClick={() => setCameraActive(!cameraActive)}
            className={`p-4 rounded-full ${cameraActive ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {cameraActive ? <Video /> : <VideoOff />}
          </button>
          
          <button className="p-4 rounded-full bg-red-500 text-white">
            <PhoneOff />
          </button>
        </div>
      </main>
    </div>
  )
}
