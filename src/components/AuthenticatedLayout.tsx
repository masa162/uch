'use client'

import Sidebar from './Sidebar';
import AuthRequiredModal from './AuthRequiredModal';

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <Sidebar />
          </aside>
          <main className="w-full md:w-3/4">
            {children}
          </main>
        </div>
      </div>
      <AuthRequiredModal />
    </div>
  );
}