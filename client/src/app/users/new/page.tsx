'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AGENT' as 'AGENT' | 'ADMIN',
        phone: '',
        status: 'Active',
        commissionRate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/users');
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao criar usuário');
            }
        } catch (error) {
            console.error('Error submitting form', error);
            alert('Erro ao criar usuário');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Usuário</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
                <div className="grid grid-cols-1 gap-6">
                    {/* Basic Info */}
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Informações Básicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Senha *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Perfil e Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perfil *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                >
                                    <option value="AGENT">Agente/Corretor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                >
                                    <option value="Active">Ativo</option>
                                    <option value="Inactive">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Commission */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Contato e Comissão</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Taxa de Comissão (%)</label>
                                <input
                                    type="number"
                                    name="commissionRate"
                                    value={formData.commissionRate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    placeholder="Ex: 3.5"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-purple-800"
                        >
                            Salvar Usuário
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
}
