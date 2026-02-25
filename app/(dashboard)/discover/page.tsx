'use client';

import { useEffect, useState } from 'react';
import { SwipeCard } from '@/components/swipe-card';
import { getDiscoverProfiles, submitSwipe } from '@/lib/actions/matching';
import { Loader2 } from 'lucide-react';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    const data = await getDiscoverProfiles();
    setProfiles(data);
    setLoading(false);
  }

  async function handleSwipe(isLike: boolean, swipedId: string) {
    const nextProfiles = [...profiles];
    nextProfiles.pop(); // Remove the top card
    setProfiles(nextProfiles);

    const result = await submitSwipe(swipedId, isLike);
    if (result.match) {
      alert("It's a match!"); // Simple alert for MVP
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center pt-32"><Loader2 className="w-10 h-10 animate-spin text-red-500"/></div>;
  }

  return (
    <div className="container mx-auto max-w-md pt-10 px-4 h-[600px] relative flex justify-center items-center">
      {profiles.length > 0 ? (
        profiles.map((profile, i) => (
          <div key={profile.clerkId} style={{ zIndex: i }}>
            {i === profiles.length - 1 && (
              <SwipeCard 
                profile={profile} 
                onSwipe={(isLike) => handleSwipe(isLike, profile.clerkId)} 
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-2">No more geeks!</h2>
          <p>Check back later for more profiles.</p>
        </div>
      )}
    </div>
  );
}