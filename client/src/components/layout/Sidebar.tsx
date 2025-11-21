import Link from 'next/link';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-primary text-white min-h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-secondary">Vendo Ideias</h1>
                <p className="text-xs text-gray-300">CRM Imobiliário</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <Link href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    Dashboard
                </Link>
                <Link href="/leads" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    Leads (Kanban)
                </Link>
                <Link href="/properties" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    Imóveis
                </Link>
                <Link href="/owners" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    Proprietários
                </Link>
                <Link href="/appointments" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    Agenda
                </Link>
                <Link href="/deals" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-800 hover:text-white">
                    💼 Deals
                </Link>
            </nav>

            <div className="p-4 border-t border-purple-800">
                <button className="w-full py-2 px-4 bg-secondary text-primary font-bold rounded hover:bg-yellow-400 transition">
                    Novo Lead
                </button>
            </div>
        </aside>
    );
}
