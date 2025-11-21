'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';

interface Lead {
    id: string;
    name: string;
    phone: string;
}

interface Property {
    id: string;
    title: string;
    city: string;
    price: number;
}

interface User {
    id: string;
    name: string;
    email: string;
}

export default function NewDealPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<User[]>([]);

    const [formData, setFormData] = useState({
        leadId: '',
        propertyId: '',
        agentId: '',
        value: '',
        commission: '',
        status: 'Draft'
    });

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [leadsRes, propertiesRes] = await Promise.all([
                fetch('/api/leads'),
                fetch('/api/properties')
            ]);

            const leadsData = await leadsRes.json();
            const propertiesData = await propertiesRes.json();

            setLeads(leadsData);
            setProperties(propertiesData);

            // Mock agents data - replace with actual API call when available
            setAgents([
                { id: '1', name: 'Agente 1', email: 'agente1@example.com' }
            ]);
        } catch (error) {
            console.error('Failed to fetch form data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    value: parseFloat(formData.value),
                    commission: formData.commission ? parseFloat(formData.commission) : null
                }),
            });

            if (res.ok) {
                router.push('/deals');
            } else {
                const error = await res.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating deal', error);
            alert('Erro ao criar deal');
        } finally {
            setLoading(false);
        }
    };

    const handlePropertyChange = (propertyId: string) => {
        setFormData({ ...formData, propertyId });
        const property = properties.find(p => p.id === propertyId);
        if (property && !formData.value) {
            setFormData(prev => ({ ...prev, propertyId, value: property.price.toString() }));
        }
    };

    const calculateCommission = (value: string, percentage: number = 5) => {
        if (value) {
            const commission = (parseFloat(value) * percentage) / 100;
            setFormData(prev => ({ ...prev, commission: commission.toString() }));
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Novo Deal</h1>
                    <p className="text-gray-600 mt-1">Crie uma nova proposta comercial</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Lead Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lead / Cliente *
                        </label>
                        <select
                            value={formData.leadId}
                            onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        >
                            <option value="">Selecione um lead</option>
                            {leads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.name} - {lead.phone}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Property Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imóvel *
                        </label>
                        <select
                            value={formData.propertyId}
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        >
                            <option value="">Selecione um imóvel</option>
                            {properties.map((property) => (
                                <option key={property.id} value={property.id}>
                                    {property.title} - {property.city} - R$ {property.price.toLocaleString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Agent Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Agente Responsável *
                        </label>
                        <select
                            value={formData.agentId}
                            onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        >
                            <option value="">Selecione um agente</option>
                            {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valor da Proposta *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full border rounded-lg pl-10 pr-4 py-2"
                                    placeholder="0,00"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        {/* Commission */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comissão
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    value={formData.commission}
                                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                                    className="w-full border rounded-lg pl-10 pr-4 py-2"
                                    placeholder="0,00"
                                    step="0.01"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => calculateCommission(formData.value, 5)}
                                className="text-xs text-primary hover:underline mt-1"
                            >
                                Calcular 5% do valor
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            <option value="Draft">Rascunho</option>
                            <option value="Sent">Enviado</option>
                            <option value="Signed">Assinado</option>
                            <option value="Rejected">Rejeitado</option>
                        </select>
                    </div>

                    {/* Summary Box */}
                    {formData.value && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="font-semibold text-purple-900 mb-2">Resumo da Proposta</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Valor da Proposta:</span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.value))}
                                    </span>
                                </div>
                                {formData.commission && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Comissão:</span>
                                        <span className="font-semibold text-green-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.commission))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-800 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Criar Deal'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
