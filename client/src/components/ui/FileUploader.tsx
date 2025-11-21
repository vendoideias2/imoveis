'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface FileUploaderProps {
    accept?: string;
    maxSize?: number; // in MB
    maxFiles?: number;
    multiple?: boolean;
    onUpload: (files: File[]) => void;
    label?: string;
}

interface FilePreview {
    file: File;
    preview: string;
    error?: string;
}

export default function FileUploader({
    accept = 'image/jpeg,image/jpg,image/png,image/webp',
    maxSize = 5,
    maxFiles = 10,
    multiple = true,
    onUpload,
    label = 'Fazer upload de arquivos'
}: FileUploaderProps) {
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        const acceptedTypes = accept.split(',');
        const isValidType = acceptedTypes.some(type => {
            if (type.includes('/*')) {
                const [mainType] = type.split('/');
                return file.type.startsWith(mainType);
            }
            return file.type === type;
        });

        if (!isValidType) {
            return 'Tipo de arquivo não suportado';
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            return `Arquivo muito grande (máximo ${maxSize}MB)`;
        }

        return null;
    };

    const createPreview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                resolve('/pdf-icon.svg'); // Placeholder for PDF icon
            } else {
                resolve('/file-icon.svg'); // Generic file icon
            }
        });
    };

    const handleFiles = async (newFiles: FileList | null) => {
        if (!newFiles) return;

        const fileArray = Array.from(newFiles);
        const currentFileCount = files.length;

        if (currentFileCount + fileArray.length > maxFiles) {
            alert(`Você pode fazer upload de no máximo ${maxFiles} arquivos`);
            return;
        }

        const filePreviews: FilePreview[] = [];

        for (const file of fileArray) {
            const error = validateFile(file);
            const preview = await createPreview(file);

            filePreviews.push({
                file,
                preview,
                error: error || undefined
            });
        }

        setFiles(prev => [...prev, ...filePreviews]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleUploadClick = () => {
        const validFiles = files.filter(f => !f.error).map(f => f.file);
        if (validFiles.length === 0) {
            alert('Nenhum arquivo válido para fazer upload');
            return;
        }
        onUpload(validFiles);
        setFiles([]);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                        ? 'border-primary bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center space-y-2">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="text-gray-600">
                        Arraste arquivos aqui ou{' '}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary hover:text-purple-800 font-medium"
                        >
                            clique para selecionar
                        </button>
                    </p>
                    <p className="text-xs text-gray-500">
                        Máximo {maxFiles} arquivos, {maxSize}MB cada
                    </p>
                </div>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                        Arquivos Selecionados ({files.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {files.map((filePreview, index) => (
                            <div
                                key={index}
                                className={`relative border rounded-lg overflow-hidden ${filePreview.error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                {/* Preview Image */}
                                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                    {filePreview.file.type.startsWith('image/') ? (
                                        <img
                                            src={filePreview.preview}
                                            alt={filePreview.file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <svg
                                                className="w-8 h-8 mx-auto text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="text-xs text-gray-500">PDF</span>
                                        </div>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="p-2 bg-white">
                                    <p className="text-xs font-medium text-gray-700 truncate">
                                        {filePreview.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(filePreview.file.size)}
                                    </p>
                                    {filePreview.error && (
                                        <p className="text-xs text-red-600 mt-1">{filePreview.error}</p>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upload Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleUploadClick}
                            disabled={files.every(f => f.error)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Fazer Upload ({files.filter(f => !f.error).length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
