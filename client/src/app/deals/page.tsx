'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface Deal {
    id: string;
    value: number;
    commission: number | null;
    status: string;
    createdAt: string;
    lead: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    property: {
        id: string;
        title: string;
        type: string;
        city: string;
        price: number;
    };
    agent: {
        id: string;
        name: string;
        email: string;
    };
}

interface Stats {
    total: number;
    byStatus: Record<string, number>;
    totalSignedValue: number;
    totalCommission: number;
}

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

    useEffect(() => {
        fetchDeals();
        fetchStats();
    }, []);

    const fetchDeals = async () => {
        try {
            const res = await fetch('/api/deals');
            const data = await res.json();
            setDeals(data);
        } catch (error) {
            console.error('Failed to fetch deals', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/deals/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleDelete = async (id: string, lead: string) => {
        if (!confirm(`Tem certeza que deseja excluir o deal com ${lead}?`)) return;

        try {
            const res = await fetch(`/api/deals/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchDeals();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to delete deal', error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/deals/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchDeals();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Sent': 'bg-blue-100 text-blue-800',
            'Signed': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'Draft': 'Rascunho',
            'Sent': 'Enviado',
            'Signed': 'Assinado',
            'Rejected': 'Rejeitado'
        };
        return labels[status] || status;
    };

    const dealsByStatus = {
        Draft: deals.filter(d => d.status === 'Draft'),
        Sent: deals.filter(d => d.status === 'Sent'),
        Signed: deals.filter(d => d.status === 'Signed'),
        Rejected: deals.filter(d => d.status === 'Rejected')
    };

    // Drag and drop handlers
    const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

    const handleDragStart = (deal: Deal) => {
        setDraggedDeal(deal);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();

        if (!draggedDeal || draggedDeal.status === newStatus) {
            setDraggedDeal(null);
            return;
        }

        // Update status
        await handleStatusChange(draggedDeal.id, newStatus);
        setDraggedDeal(null);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Negociações & Propostas</h1>
                <div className="flex gap-3">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-l-lg ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                            📊 Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-r-lg ${viewMode === 'table' ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                            📋 Tabela
                        </button>
                    </div>
                    <Link href="/deals/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition">
                        + Novo Deal
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-400">
                        <h3 className="text-gray-500 text-sm font-medium">Total de Deals</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-medium">Enviados</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.byStatus['Sent'] || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-medium">Fechados</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.byStatus['Signed'] || 0}</p>
                        <span className="text-green-600 text-xs font-medium">
                            {formatPrice(stats.totalSignedValue)}
                        </span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm font-medium">Comissões</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {formatPrice(stats.totalCommission)}
                        </p>
                    </div>
                </div>
            )}

            {/* Drag-and-drop hint */}
            {viewMode === 'kanban' && !loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Arraste os cards entre as colunas para mudar o status automaticamente
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">Carregando deals...</p>
                </div>
            ) : viewMode === 'kanban' ? (
                /* Kanban View with Drag-and-Drop */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(dealsByStatus).map(([status, statusDeals]) => (
                        <div
                            key={status}
                            className="bg-gray-50 rounded-lg p-4"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700">
                                    {getStatusLabel(status)}
                                </h3>
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                    {statusDeals.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {statusDeals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        draggable
                                        onDragStart={() => handleDragStart(deal)}
                                        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-move ${draggedDeal?.id === deal.id ? 'opacity-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-800 text-sm">
                                                {deal.lead.name}
                                            </h4>
                                            <button
                                                onClick={() => handleDelete(deal.id, deal.lead.name)}
                                                className="text-gray-400 hover:text-red-600 text-xs"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2 truncate">
                                            {deal.property.title}
                                        </p>
                                        <p className="text-lg font-bold text-primary mb-2">
                                            {formatPrice(deal.value)}
                                        </p>
                                        {deal.commission && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                Comissão: {formatPrice(deal.commission)}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>👤 {deal.agent.name}</span>
                                            <span>{formatDate(deal.createdAt)}</span>
                                        </div>

                                        {/* Status Actions */}
                                        <div className="flex gap-1">
                                            {status === 'Draft' && (
                                                <button
                                                    onClick={() => handleStatusChange(deal.id, 'Sent')}
                                                    className="flex-1 bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600"
                                                >
                                                    Enviar
                                                </button>
                                            )}
                                            {status === 'Sent' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(deal.id, 'Signed')}
                                                        className="flex-1 bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
                                                    >
                                                        Fechar
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(deal.id, 'Rejected')}
                                                        className="flex-1 bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </>
                                            )}
                                            <Link
                                                href={`/deals/${deal.id}/edit`}
                                                className="flex-1 bg-gray-200 text-gray-700 text-xs py-1 rounded hover:bg-gray-300 text-center"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {statusDeals.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        Nenhum deal
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            ) : (
                /* Table View */
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imóvel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {deals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{deal.lead.name}</div>
                                        <div className="text-sm text-gray-500">{deal.lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{deal.property.title}</div>
                                        <div className="text-sm text-gray-500">{deal.property.city}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatPrice(deal.value)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {deal.commission ? formatPrice(deal.commission) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(deal.status)}`}>
                                            {getStatusLabel(deal.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {deal.agent.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(deal.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link href={`/deals/${deal.id}/edit`} className="text-primary hover:text-purple-900">
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(deal.id, deal.lead.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {deals.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Nenhum deal cadastrado ainda
                        </div>
                    )}
                </div>
            )
            }
        </Layout >
    );
}
