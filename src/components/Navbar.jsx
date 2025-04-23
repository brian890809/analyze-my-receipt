'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Receipt, UserCog, LogOut, Plus } from 'lucide-react';

export default function Navbar() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Receipt className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-heading font-semibold hidden sm:inline-block">Receipt Gobbler</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="mr-2 text-sm text-muted-foreground hidden md:block">
            {user?.email && <span>Welcome, {user.email.split('@')[0]}</span>}
          </div>
          
          <Link href="/add-new-receipt">
            <Button variant="outline" size="sm" className="rounded-xl shadow-sm gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline-block">Add Receipt</span>
            </Button>
          </Link>
          
          <Link href="/user">
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/5">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline-block ml-1.5">Settings</span>
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="rounded-xl hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block ml-1.5">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}