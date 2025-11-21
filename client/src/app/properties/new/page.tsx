'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/ui/FileUploader';

interface Document {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}

interface Owner {
    id: string;
    name: string;
}

export default function NewPropertyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        type: 'HOUSE',
        listingType: 'SALE',
        ownerId: '',
        description: '',
        bedrooms: '',
        areaUseful: '',
        city: ''
    });
    const [owners, setOwners] = useState<Owner[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const res = await fetch('/api/owners');
            if (res.ok) {
                const data = await res.json();
                setOwners(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, ownerId: data[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching owners', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // First, create the property
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    documents
                }),
            });

            if (res.ok) {
                const property = await res.json();

                // Then upload images if any
                if (images.length > 0) {
                    const formDataImages = new FormData();
                    images.forEach((image) => {
                        formDataImages.append('images', image);
                    });

                    await fetch(`/api/properties/${property.id}/images`, {
                        method: 'POST',
                        body: formDataImages,
                    });
                }

                router.push('/properties');
            } else {
                alert('Erro ao criar imóvel');
            }
        } catch (error) {
            console.error('Error submitting form', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (files: File[]) => {
        setImages(files);
    };

    const handleDocumentUpload = async (files: File[]) => {
        setIsUploading(true);
        const uploadFormData = new FormData();
        files.forEach(file => {
            uploadFormData.append('files', file);
        });

        try {
            const res = await fetch('/api/upload/multiple', {
                method: 'POST',
                body: uploadFormData
            });

            if (res.ok) {
                const data = await res.json();
                setDocuments(prev => [...prev, ...data.files]);
            } else {
                alert('Erro ao fazer upload dos documentos');
            }
        } catch (error) {
            console.error('Error uploading documents', error);
            alert('Erro ao fazer upload dos documentos');
        } finally {
            setIsUploading(false);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Imóvel</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-4xl">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título do Anúncio *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Proprietário *</label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                required
                            >
                                <option value="">Selecione um proprietário</option>
                                {owners.map(owner => (
                                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preço (R$) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Finalidade *</label>
                            <select
                                name="listingType"
                                value={formData.listingType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            >
                                <option value="SALE">Venda</option>
                                <option value="RENT">Aluguel</option>
                                <option value="BOTH">Venda e Aluguel</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo do Imóvel *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            >
                                <option value="HOUSE">Casa</option>
                                <option value="APARTMENT">Apartamento</option>
                                <option value="LAND">Terreno</option>
                                <option value="COMMERCIAL">Comercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cidade</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quartos</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Área Útil (m²)</label>
                            <input
                                type="number"
                                name="areaUseful"
                                value={formData.areaUseful}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Fotos do Imóvel</h3>
                        <FileUploader
                            onUpload={handleImageUpload}
                            accept="image/*"
                            label="Upload de Fotos"
                            multiple={true}
                        />
                    </div>

                    {/* Documents Upload Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Documentos do Imóvel</h3>
                        <FileUploader
                            onUpload={handleDocumentUpload}
                            accept="application/pdf,image/*"
                            label="Upload de Documentos (Escritura, IPTU, etc)"
                            multiple={true}
                        />
                        {documents.length > 0 && (
                            <div className="mt-2 grid grid-cols-1 gap-2">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500">📄</span>
                                            <span className="text-sm font-medium text-gray-700">{doc.filename}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            Salvar Imóvel
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
}
