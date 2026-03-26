'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/chat');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Loader size="lg" label="Loading..." />
    </div>
  );
}

