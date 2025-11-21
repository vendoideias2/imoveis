'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ui/ImageGallery';
import FileUploader from '@/components/ui/FileUploader';

interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    bedrooms: number;
    areaUseful: number;
    city: string;
    images: string[];
    documents: any[];
    contracts: any[];
    inspections: any[];
    owner: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'contracts' | 'inspections'>('details');

    useEffect(() => {
        if (params.id) {
            fetchProperty(params.id as string);
        }
    }, [params.id]);

    const fetchProperty = async (id: string) => {
        try {
            const res = await fetch(`/api/properties/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProperty(data);
            } else {
                alert('Imóvel não encontrado');
                router.push('/properties');
            }
        } catch (error) {
            console.error('Error fetching property', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContractUpload = async (files: File[]) => {
        if (!property) return;
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('propertyId', property.id);
        formData.append('status', 'DRAFT'); // Default status
        formData.append('startDate', new Date().toISOString()); // Placeholder
        formData.append('endDate', new Date().toISOString()); // Placeholder
        formData.append('value', property.price.toString());

        try {
            // We need to upload files first then create contract, or update backend to handle both.
            // For simplicity, let's assume we upload files to generic upload and then create contract.
            // Actually, let's use the generic upload to get URLs and then create the contract.

            const uploadRes = await fetch('/api/upload/multiple', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            const contractRes = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    tenantId: 'placeholder-tenant-id', // We need a tenant selector here ideally
                    status: 'DRAFT',
                    startDate: new Date(),
                    endDate: new Date(),
                    value: property.price,
                    documents: uploadData.files
                })
            });

            if (contractRes.ok) {
                fetchProperty(property.id);
                alert('Contrato criado com sucesso!');
            }
        } catch (error) {
            console.error('Error creating contract', error);
            alert('Erro ao criar contrato. Certifique-se de implementar a seleção de inquilino.');
        }
    };

    const handleInspectionUpload = async (files: File[]) => {
        if (!property) return;
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const uploadRes = await fetch('/api/upload/multiple', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            const inspectionRes = await fetch('/api/inspections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    date: new Date(),
                    type: 'ENTRY',
                    status: 'COMPLETED',
                    observer: 'Corretor',
                    documents: uploadData.files
                })
            });

            if (inspectionRes.ok) {
                fetchProperty(property.id);
                alert('Vistoria registrada com sucesso!');
            }
        } catch (error) {
            console.error('Error creating inspection', error);
            alert('Erro ao registrar vistoria');
        }
    };

    if (loading) return <Layout><p>Carregando...</p></Layout>;
    if (!property) return <Layout><p>Imóvel não encontrado</p></Layout>;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
                <div className="space-x-2">
                    <Link href={`/properties/${property.id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Editar
                    </Link>
                    <Link href="/properties" className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                        Voltar
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Detalhes
                    </button>
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === 'contracts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('contracts')}
                    >
                        Contratos
                    </button>
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === 'inspections' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('inspections')}
                    >
                        Vistorias
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <ImageGallery images={property.images} />
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-700 mb-2">Informações Principais</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Preço</p>
                                            <p className="text-xl font-bold text-primary">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tipo</p>
                                            <p className="font-medium">{property.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Quartos</p>
                                            <p className="font-medium">{property.bedrooms}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Área Útil</p>
                                            <p className="font-medium">{property.areaUseful} m²</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Cidade</p>
                                            <p className="font-medium">{property.city}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-700 mb-2">Proprietário</h3>
                                    <p className="font-medium">{property.owner?.name}</p>
                                    <p className="text-sm text-gray-600">{property.owner?.email}</p>
                                    <p className="text-sm text-gray-600">{property.owner?.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contracts' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Contratos do Imóvel</h3>
                                {/* Placeholder for adding a full contract */}
                            </div>

                            <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-100">
                                <h4 className="font-medium text-blue-800 mb-2">Adicionar Contrato Rápido (Arquivo)</h4>
                                <p className="text-sm text-blue-600 mb-4">Faça upload do contrato assinado para arquivar.</p>
                                <FileUploader
                                    onUpload={handleContractUpload}
                                    label="Upload de Contrato (PDF)"
                                    accept="application/pdf"
                                />
                            </div>

                            <div className="space-y-4">
                                {property.contracts?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Nenhum contrato registrado.</p>
                                ) : (
                                    property.contracts.map((contract) => (
                                        <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">Contrato #{contract.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-600">Status: {contract.status}</p>
                                                    <p className="text-sm text-gray-600">Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.value)}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {contract.documents && contract.documents.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Arquivos:</p>
                                                    <div className="flex gap-2">
                                                        {contract.documents.map((doc: any, idx: number) => (
                                                            <a
                                                                key={idx}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600 hover:underline flex items-center"
                                                            >
                                                                📄 {doc.filename}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'inspections' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Vistorias</h3>
                            </div>

                            <div className="mb-6 bg-green-50 p-4 rounded border border-green-100">
                                <h4 className="font-medium text-green-800 mb-2">Nova Vistoria (Arquivo)</h4>
                                <p className="text-sm text-green-600 mb-4">Faça upload do relatório de vistoria e fotos.</p>
                                <FileUploader
                                    onUpload={handleInspectionUpload}
                                    label="Upload de Vistoria (PDF/Imagens)"
                                    accept="image/*,application/pdf"
                                />
                            </div>

                            <div className="space-y-4">
                                {property.inspections?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Nenhuma vistoria registrada.</p>
                                ) : (
                                    property.inspections.map((inspection) => (
                                        <div key={inspection.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">Vistoria {inspection.type === 'ENTRY' ? 'de Entrada' : 'de Saída'}</p>
                                                    <p className="text-sm text-gray-600">Data: {new Date(inspection.date).toLocaleDateString()}</p>
                                                    <p className="text-sm text-gray-600">Responsável: {inspection.observer}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded ${inspection.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {inspection.status}
                                                </span>
                                            </div>
                                            {inspection.documents && inspection.documents.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Arquivos:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {inspection.documents.map((doc: any, idx: number) => (
                                                            <a
                                                                key={idx}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600 hover:underline flex items-center"
                                                            >
                                                                {doc.mimetype?.includes('image') ? '🖼️' : '📄'} {doc.filename}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
