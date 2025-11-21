'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import ImageGallery from '@/components/ui/ImageGallery';
import FileUploader from '@/components/ui/FileUploader';

interface Property {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    price: number;
    condoPrice?: number;
    iptuPrice?: number;
    areaTotal?: number;
    areaUseful?: number;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    images: string[];
    ownerId: string;
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, []);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/properties/${params.id}`);
            const data = await res.json();
            setProperty(data);
        } catch (error) {
            console.error('Error fetching property:', error);
            alert('Erro ao carregar imóvel');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/properties/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(property)
            });

            if (res.ok) {
                alert('Imóvel atualizado com sucesso!');
                router.push('/properties');
            } else {
                alert('Erro ao atualizar imóvel');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            alert('Erro ao atualizar imóvel');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (files: File[]) => {
        setUploading(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const res = await fetch(`/api/properties/${params.id}/images`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                await fetchProperty(); // Reload to get updated images
                alert('Imagens enviadas com sucesso!');
            } else {
                alert('Erro ao enviar imagens');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Erro ao enviar imagens');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
            </Layout>
        );
    }

    if (!property) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-red-600">Imóvel não encontrado</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Editar Imóvel</h1>
                    <p className="text-gray-600 mt-1">Atualize as informações do imóvel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Básicas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                                <input
                                    type="text"
                                    value={property.title}
                                    onChange={(e) => setProperty({ ...property, title: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={property.description || ''}
                                    onChange={(e) => setProperty({ ...property, description: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select
                                    value={property.type}
                                    onChange={(e) => setProperty({ ...property, type: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="HOUSE">Casa</option>
                                    <option value="APARTMENT">Apartamento</option>
                                    <option value="LAND">Terreno</option>
                                    <option value="COMMERCIAL">Comercial</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={property.status}
                                    onChange={(e) => setProperty({ ...property, status: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                >
                                    <option value="AVAILABLE">Disponível</option>
                                    <option value="RESERVED">Reservado</option>
                                    <option value="SOLD">Vendido</option>
                                    <option value="RENTED">Alugado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Valores</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
                                <input
                                    type="number"
                                    value={property.price}
                                    onChange={(e) => setProperty({ ...property, price: parseFloat(e.target.value) })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Condomínio</label>
                                <input
                                    type="number"
                                    value={property.condoPrice || ''}
                                    onChange={(e) => setProperty({ ...property, condoPrice: parseFloat(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IPTU</label>
                                <input
                                    type="number"
                                    value={property.iptuPrice || ''}
                                    onChange={(e) => setProperty({ ...property, iptuPrice: parseFloat(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Características</h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
                                <input
                                    type="number"
                                    value={property.bedrooms || ''}
                                    onChange={(e) => setProperty({ ...property, bedrooms: parseInt(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                                <input
                                    type="number"
                                    value={property.bathrooms || ''}
                                    onChange={(e) => setProperty({ ...property, bathrooms: parseInt(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                                <input
                                    type="number"
                                    value={property.parkingSpaces || ''}
                                    onChange={(e) => setProperty({ ...property, parkingSpaces: parseInt(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área Total (m²)</label>
                                <input
                                    type="number"
                                    value={property.areaTotal || ''}
                                    onChange={(e) => setProperty({ ...property, areaTotal: parseFloat(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área Útil (m²)</label>
                                <input
                                    type="number"
                                    value={property.areaUseful || ''}
                                    onChange={(e) => setProperty({ ...property, areaUseful: parseFloat(e.target.value) || undefined })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Localização</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                                <input
                                    type="text"
                                    value={property.address || ''}
                                    onChange={(e) => setProperty({ ...property, address: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <input
                                    type="text"
                                    value={property.city || ''}
                                    onChange={(e) => setProperty({ ...property, city: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <input
                                    type="text"
                                    value={property.state || ''}
                                    onChange={(e) => setProperty({ ...property, state: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Galeria de Imagens</h2>

                        <ImageGallery
                            images={property.images}
                            propertyId={property.id}
                            onUpdate={fetchProperty}
                        />

                        <div className="border-t pt-6">
                            <h3 className="font-medium text-gray-700 mb-4">Adicionar Novas Imagens</h3>
                            <FileUploader
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                maxSize={5}
                                maxFiles={10}
                                onUpload={handleImageUpload}
                            />
                            {uploading && (
                                <p className="text-sm text-primary mt-2">Enviando imagens...</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-800 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
