'use client';

import Sidebar from './Sidebar';
import { useSession, signOut } from 'next-auth/react';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { data: session } = useSession();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 h-16 flex justify-between items-center px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-700">{session?.user?.name || 'Usuário'}</p>
                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
                        </div>

                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 border-gray-100"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}

                        <button
                            onClick={() => signOut()}
                            className="text-sm text-gray-500 hover:text-red-600 ml-2"
                        >
                            Sair
                        </button>
                    </div>
                </header>
                <div className="p-6 overflow-auto flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
