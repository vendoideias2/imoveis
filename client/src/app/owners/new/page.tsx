'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/ui/FileUploader';

interface Document {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}

export default function NewOwnerPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        docNumber: '',
        type: 'PF' as 'PF' | 'PJ',
        maritalStatus: '',
        profession: '',
        address: '',
        spouseName: '',
        spouseDoc: '',
        spouseEmail: '',
        spousePhone: '',
        spouseProfession: ''
    });
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/owners', {
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
                router.push('/owners');
            } else {
                alert('Erro ao criar proprietário');
            }
        } catch (error) {
            console.error('Error submitting form', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (files: File[]) => {
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
                alert('Erro ao fazer upload dos arquivos');
            }
        } catch (error) {
            console.error('Error uploading files', error);
            alert('Erro ao fazer upload dos arquivos');
        } finally {
            setIsUploading(false);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Proprietário</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-4xl">
                <div className="grid grid-cols-1 gap-6">
                    {/* Dados Pessoais */}
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados Pessoais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                >
                                    <option value="PF">Pessoa Física (CPF)</option>
                                    <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {formData.type === 'PF' ? 'CPF' : 'CNPJ'} *
                                </label>
                                <input
                                    type="text"
                                    name="docNumber"
                                    value={formData.docNumber}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    placeholder={formData.type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nome Completo / Razão Social *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    required
                                />
                            </div>
                            {formData.type === 'PF' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                                        <select
                                            name="maritalStatus"
                                            value={formData.maritalStatus}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Solteiro(a)">Solteiro(a)</option>
                                            <option value="Casado(a)">Casado(a)</option>
                                            <option value="Divorciado(a)">Divorciado(a)</option>
                                            <option value="Viúvo(a)">Viúvo(a)</option>
                                            <option value="União Estável">União Estável</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Profissão</label>
                                        <input
                                            type="text"
                                            name="profession"
                                            value={formData.profession}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Dados do Cônjuge */}
                    {formData.type === 'PF' && (formData.maritalStatus === 'Casado(a)' || formData.maritalStatus === 'União Estável') && (
                        <div className="border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados do Cônjuge/Companheiro(a)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="spouseName"
                                        value={formData.spouseName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                                    <input
                                        type="text"
                                        name="spouseDoc"
                                        value={formData.spouseDoc}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profissão</label>
                                    <input
                                        type="text"
                                        name="spouseProfession"
                                        value={formData.spouseProfession}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="spouseEmail"
                                        value={formData.spouseEmail}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                                    <input
                                        type="tel"
                                        name="spousePhone"
                                        value={formData.spousePhone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contato e Endereço */}
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Contato e Endereço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    placeholder="(11) 99999-9999"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                    placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documentos */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Documentos</h2>
                        <div className="mb-4">
                            <FileUploader
                                onUpload={handleFileUpload}
                                accept="image/*,application/pdf"
                                label="Upload de Documentos (PDF ou Imagem)"
                                multiple={true}
                            />
                            {isUploading && <p className="text-sm text-blue-600 mt-2">Enviando arquivos...</p>}
                        </div>

                        {documents.length > 0 && (
                            <div className="grid grid-cols-1 gap-2">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500">
                                                {doc.mimetype.includes('pdf') ? '📄' : '🖼️'}
                                            </span>
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
                            Salvar Proprietário
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
}
