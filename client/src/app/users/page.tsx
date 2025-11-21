'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status: string;
    commissionRate?: number;
    _count?: {
        leads: number;
        deals: number;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Failed to delete user', error);
            alert('Erro ao excluir usuário');
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            ADMIN: 'bg-red-100 text-red-800',
            AGENT: 'bg-blue-100 text-blue-800',
        };
        return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status: string) => {
        return status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Usuários & Agentes</h1>
                <Link href="/users/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition">
                    + Novo Usuário
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
                                    Perfil
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comissão
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded ${getRoleBadge(user.role)}`}>
                                            {user.role === 'ADMIN' ? 'Administrador' : 'Agente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.commissionRate ? `${user.commissionRate}%` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user._count && (
                                            <div>
                                                {user._count.leads} leads • {user._count.deals} deals
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link href={`/users/${user.id}/edit`} className="text-primary hover:text-purple-900">
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
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
