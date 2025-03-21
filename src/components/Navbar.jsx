'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Navbar() {
  const { logout } = useAuth();
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
    <nav className="flex items-center justify-end p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/add-new-receipt">
          <Button variant="outline">Add a new Receipt</Button>
        </Link>
        <Button variant="destructive" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </nav>
  );
}