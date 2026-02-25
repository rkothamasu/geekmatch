import { getMatches } from '@/lib/actions/matching';
import { Card, CardContent } from '@/components/ui/card';

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Matches</h1>
      
      {matches.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-dashed">
          <p className="text-xl">No matches yet. Keep swiping!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.clerkId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="bg-gray-200 h-48 w-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xl">{match.name}</h3>
                  <p className="text-gray-600 line-clamp-2 mt-2">{match.bio || 'A mysterious geek.'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}