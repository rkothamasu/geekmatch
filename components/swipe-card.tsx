'use client';

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X } from 'lucide-react';

interface SwipeCardProps {
  profile: {
    clerkId: string;
    name: string;
    bio: string | null;
  };
  onSwipe: (isLike: boolean) => void;
}

export function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const [leaveX, setLeaveX] = useState(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setLeaveX(1000);
      onSwipe(true);
    } else if (info.offset.x < -threshold) {
      setLeaveX(-1000);
      onSwipe(false);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: leaveX, opacity: leaveX ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="absolute w-full h-[500px]"
    >
      <Card className="h-full w-full overflow-hidden shadow-xl border-2">
        <CardContent className="h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
            <p className="text-lg opacity-90">{profile.bio || 'No bio provided.'}</p>
          </div>
          
          <div className="flex justify-center gap-6 mt-8 opacity-0">
             {/* Invisible spacer to reserve area if buttons were added */}
             <div className="p-4 rounded-full bg-red-500/20"><X className="w-8 h-8 text-red-500"/></div>
             <div className="p-4 rounded-full bg-green-500/20"><Heart className="w-8 h-8 text-green-500"/></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}