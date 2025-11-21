import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-primary';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-primary">Vendo Ideias</h1>
                <p className="text-xs text-gray-500 mt-1">CRM Imobiliário</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-6">
                <Link href="/" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/')}`}>
                    Dashboard
                </Link>
                <Link href="/leads" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/leads')}`}>
                    Leads (Kanban)
                </Link>
                <Link href="/properties" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/properties')}`}>
                    Imóveis
                </Link>
                <Link href="/tenants" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/tenants')}`}>
                    Inquilinos
                </Link>
                <Link href="/owners" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/owners')}`}>
                    Proprietários
                </Link>
                <Link href="/appointments" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/appointments')}`}>
                    Agenda
                </Link>
                <Link href="/deals" className={`block py-2.5 px-4 rounded-lg transition duration-200 ${isActive('/deals')}`}>
                    💼 Deals
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="w-full py-2 px-4 bg-primary text-white font-medium rounded-lg hover:bg-purple-700 transition shadow-sm">
                    Novo Lead
                </button>
            </div>
        </aside>
    );
}
