'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const WithAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const response = await fetch('/api/check-auth');
        if (response.status !== 200) {
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default WithAuth;