import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Olá, Corretor</span>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            C
                        </div>
                    </div>
                </header>
                <div className="p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
