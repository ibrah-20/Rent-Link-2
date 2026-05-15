'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  type: string;
}

export function ApartmentReels({ media }: { media: Media[] }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleNext = () => setIndex((prev) => (prev + 1) % media.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + media.length) % media.length);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === index) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [index]);

  if (media.length === 0) return null;

  return (
    <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto bg-black rounded-[32px] overflow-hidden shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={media[index].id}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="absolute inset-0"
        >
          {media[index].type === 'video' ? (
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={media[index].url}
              className="w-full h-full object-cover"
              loop
              muted={muted}
              playsInline
              onClick={() => setMuted(!muted)}
            />
          ) : (
            <img src={media[index].url} className="w-full h-full object-cover" alt="" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
            Reel {index + 1} / {media.length}
          </div>
          <button 
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 pointer-events-auto"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <button onClick={handlePrev} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all">
            <ChevronUp className="w-6 h-6" />
          </button>
          <button onClick={handleNext} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          key={index}
        />
      </div>
    </div>
  );
}
