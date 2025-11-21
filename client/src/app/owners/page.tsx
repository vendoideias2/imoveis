'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface Owner {
    id: string;
    name: string;
    email: string;
    phone: string;
    docNumber: string;
    type: 'PF' | 'PJ';
    properties: Array<{ id: string; title: string; status: string }>;
}

export default function OwnersPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const res = await fetch('/api/owners');
            const data = await res.json();
            setOwners(data);
        } catch (error) {
            console.error('Failed to fetch owners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;

        try {
            const res = await fetch(`/api/owners/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchOwners();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir proprietário');
            }
        } catch (error) {
            console.error('Failed to delete owner', error);
            alert('Erro ao excluir proprietário');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Proprietários</h1>
                <Link href="/owners/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition">
                    + Novo Proprietário
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CPF/CNPJ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Imóveis
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                                        {owner.email && <div className="text-sm text-gray-500">{owner.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded ${owner.type === 'PF' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {owner.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {owner.docNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {owner.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {owner.properties?.length || 0} imóveis
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link href={`/owners/${owner.id}/edit`} className="text-primary hover:text-purple-900">
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(owner.id, owner.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
}
