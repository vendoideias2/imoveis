'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    propertyId: string;
    onUpdate?: () => void;
}

export default function ImageGallery({ images, propertyId, onUpdate }: ImageGalleryProps) {
    const [imageList, setImageList] = useState<string[]>(images);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...imageList];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedImage);

        setImageList(newImages);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        setDraggedIndex(null);

        // Save new order to backend
        await saveOrder();
    };

    const saveOrder = async () => {
        try {
            setLoading(true);
            const newOrder = imageList.map(img => images.indexOf(img));

            const res = await fetch(`/api/properties/${propertyId}/images/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newOrder })
            });

            if (res.ok) {
                onUpdate?.();
            } else {
                alert('Erro ao salvar ordem das imagens');
                setImageList(images); // Revert
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Erro ao salvar ordem');
            setImageList(images);
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (index: number) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/properties/${propertyId}/images/${index}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const newImages = imageList.filter((_, i) => i !== index);
                setImageList(newImages);
                onUpdate?.();
            } else {
                alert('Erro ao excluir imagem');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Erro ao excluir imagem');
        } finally {
            setLoading(false);
        }
    };

    const setMainImage = async (index: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/properties/${propertyId}/images/main/${index}`, {
                method: 'PUT'
            });

            if (res.ok) {
                const data = await res.json();
                setImageList(data.images);
                onUpdate?.();
            } else {
                alert('Erro ao definir imagem principal');
            }
        } catch (error) {
            console.error('Error setting main image:', error);
            alert('Erro ao definir imagem principal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                    Galeria de Imagens ({imageList.length})
                </h3>
                {loading && (
                    <span className="text-sm text-gray-500">Salvando...</span>
                )}
            </div>

            {imageList.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">Nenhuma imagem adicionada ainda</p>
                </div>
            ) : (
                <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        💡 <strong>Dica:</strong> Arraste as imagens para reordenar. A primeira imagem será a capa do imóvel.
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageList.map((image, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all ${draggedIndex === index
                                    ? 'border-primary opacity-50'
                                    : 'border-gray-200 hover:border-primary'
                                    } ${index === 0 ? 'ring-2 ring-primary' : ''}`}
                            >
                                {/* Main Image Badge */}
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Principal
                                    </div>
                                )}

                                {/* Image */}
                                <div
                                    className="aspect-square bg-gray-200 relative cursor-pointer"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={`${image}`}
                                        alt={`Imagem ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    {index !== 0 && (
                                        <button
                                            onClick={() => setMainImage(index)}
                                            className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition"
                                            title="Definir como principal"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteImage(index)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                        title="Excluir imagem"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Index Badge */}
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={`${selectedImage}`}
                        alt="Visualização ampliada"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
