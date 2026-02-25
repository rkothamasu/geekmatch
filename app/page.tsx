import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white p-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-extrabold tracking-tight">Geekmatch</h1>
        <p className="text-2xl font-light opacity-90">
          Find someone who speaks your language. 
          Swipe right on the code, match with the developer.
        </p>
        
        <div className="flex justify-center gap-4 pt-8">
          <Button asChild size="lg" variant="secondary" className="font-bold text-lg px-8">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-bold text-lg px-8 bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}