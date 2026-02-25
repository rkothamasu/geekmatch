import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Heart, Search } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/discover" className="text-2xl font-bold text-red-500 flex items-center gap-2">
             <Heart className="fill-current" /> Geekmatch
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/discover" className="text-gray-600 hover:text-red-500 font-medium flex items-center gap-1">
              <Search className="w-5 h-5"/> Discover
            </Link>
            <Link href="/matches" className="text-gray-600 hover:text-red-500 font-medium flex items-center gap-1">
               <Heart className="w-5 h-5"/> Matches
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}