'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface Property {
    id: string;
    title: string;
    price: number;
    type: string;
    status: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    areaUseful: number;
    images: string[];
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        city: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, properties]);

    const fetchProperties = async () => {
        try {
            const res = await fetch('/api/properties');
            const data = await res.json();
            setProperties(data);
            setFilteredProperties(data);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...properties];

        if (filters.type) {
            filtered = filtered.filter(p => p.type === filters.type);
        }

        if (filters.city) {
            filtered = filtered.filter(p =>
                p.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
        }

        setFilteredProperties(filtered);
    };

    const clearFilters = () => {
        setFilters({ type: '', city: '', minPrice: '', maxPrice: '' });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'HOUSE': 'Casa',
            'APARTMENT': 'Apartamento',
            'LAND': 'Terreno',
            'COMMERCIAL': 'Comercial'
        };
        return types[type] || type;
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Imóveis</h1>
                <Link href="/properties/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition">
                    + Novo Imóvel
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="HOUSE">Casa</option>
                            <option value="APARTMENT">Apartamento</option>
                            <option value="LAND">Terreno</option>
                            <option value="COMMERCIAL">Comercial</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            placeholder="Digite a cidade"
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mín.</label>
                        <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            placeholder="R$ 0"
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máx.</label>
                        <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            placeholder="R$ 999.999.999"
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                    Mostrando <strong>{filteredProperties.length}</strong> de <strong>{properties.length}</strong> imóveis
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">Carregando imóveis...</p>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum imóvel encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou cadastre um novo imóvel.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Image */}
                            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                                {property.images && property.images.length > 0 ? (
                                    <img
                                        src={`${property.images[0]}`}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-500 mt-2">Sem Imagem</span>
                                    </div>
                                )}
                                {property.images && property.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                        +{property.images.length - 1} fotos
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">{property.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ml-2 ${property.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                        property.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {property.status === 'AVAILABLE' ? 'Disponível' :
                                            property.status === 'SOLD' ? 'Vendido' :
                                                property.status === 'RENTED' ? 'Alugado' : 'Reservado'}
                                    </span>
                                </div>

                                <p className="text-primary font-bold text-2xl mb-3">
                                    {formatPrice(property.price)}
                                </p>

                                <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                                    {property.bedrooms > 0 && (
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            {property.bedrooms} quartos
                                        </span>
                                    )}
                                    {property.bathrooms > 0 && (
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {property.bathrooms} banheiros
                                        </span>
                                    )}
                                    {property.areaUseful > 0 && (
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            {property.areaUseful} m²
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {getTypeLabel(property.type)}
                                        </span>
                                        {property.city && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                📍 {property.city}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="text-primary hover:text-purple-800 text-sm font-medium"
                                    >
                                        Ver detalhes →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
