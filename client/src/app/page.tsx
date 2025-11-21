'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';

interface DashboardStats {
  leads: {
    total: number;
    thisMonth: number;
    growth: number;
  };
  properties: {
    active: number;
    total: number;
    percentage: string;
  };
  sales: {
    thisMonth: number;
    dealsCount: number;
    commission: number;
  };
  recentActivities: {
    leads: {
      id: string;
      name: string;
      status: string;
      createdAt: string;
    }[];
    deals: {
      id: string;
      lead: { name: string };
      property: { title: string };
      createdAt: string;
    }[];
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Agora mesmo';
      return `Há ${Math.floor(diffInHours)} horas`;
    }

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
          <h3 className="text-gray-500 text-sm font-medium">Total de Leads</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.leads.total || 0}</p>
          <span className={`text-sm font-medium mt-2 inline-block ${stats?.leads.growth && stats.leads.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats?.leads.growth && stats.leads.growth > 0 ? '+' : ''}{stats?.leads.growth || 0}% este mês
          </span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-secondary">
          <h3 className="text-gray-500 text-sm font-medium">Imóveis Ativos</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.properties.active || 0}</p>
          <span className="text-gray-400 text-sm font-medium mt-2 inline-block">
            {stats?.properties.percentage || 0}% do portfólio
          </span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Vendas no Mês</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {formatCurrency(stats?.sales.thisMonth || 0)}
          </p>
          <span className="text-green-500 text-sm font-medium mt-2 inline-block">
            {stats?.sales.dealsCount || 0} fechamentos
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead / Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentActivities.leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Novo Lead Cadastrado</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
              {stats?.recentActivities.deals?.map((deal) => (
                <tr key={deal.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deal.lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Proposta: {deal.property.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(deal.createdAt)}</td>
                </tr>
              ))}
              {(!stats?.recentActivities.leads.length && !stats?.recentActivities.deals?.length) && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500 text-sm">
                    Nenhuma atividade recente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
