'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    docNumber: string;
    type: 'PF' | 'PJ';
    contracts: Array<{ id: string; status: string; property: { title: string } }>;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/tenants');
            const data = await res.json();
            setTenants(data);
        } catch (error) {
            console.error('Failed to fetch tenants', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;

        try {
            const res = await fetch(`/api/tenants/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchTenants();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir inquilino');
            }
        } catch (error) {
            console.error('Failed to delete tenant', error);
            alert('Erro ao excluir inquilino');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inquilinos</h1>
                <Link href="/tenants/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition">
                    + Novo Inquilino
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
                                    Contratos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                        {tenant.email && <div className="text-sm text-gray-500">{tenant.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded ${tenant.type === 'PF' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {tenant.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tenant.docNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tenant.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tenant.contracts?.length || 0} contratos
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link href={`/tenants/${tenant.id}/edit`} className="text-primary hover:text-purple-900">
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(tenant.id, tenant.name)}
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
