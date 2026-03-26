import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen overflow-y-auto flex flex-col justify-start items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {children}
      </div>
    </div>
  );
}
