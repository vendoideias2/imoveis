'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    notes: string;
    createdAt: string;
}

const COLUMNS = [
    { id: 'NEW', title: 'Novo', color: 'bg-blue-100 border-blue-300' },
    { id: 'IN_PROGRESS', title: 'Em Atendimento', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'VISIT_SCHEDULED', title: 'Visita Agendada', color: 'bg-purple-100 border-purple-300' },
    { id: 'PROPOSAL', title: 'Proposta', color: 'bg-orange-100 border-orange-300' },
    { id: 'CLOSED_WON', title: 'Fechado ✓', color: 'bg-green-100 border-green-300' },
    { id: 'CLOSED_LOST', title: 'Perdido', color: 'bg-red-100 border-red-300' },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as string;

        // Update locally
        setLeads((leads) =>
            leads.map((lead) =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            )
        );

        // Update on server
        try {
            await fetch(`/api/leads/${leadId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error('Failed to update lead status', error);
            // Revert on error
            fetchLeads();
        }

        setActiveId(null);
    };

    const getLeadsByStatus = (status: string) => {
        return leads.filter((lead) => lead.status === status);
    };

    const activeLead = leads.find((lead) => lead.id === activeId);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pipeline de Leads</h1>
                <button
                    onClick={() => setShowNewLeadModal(true)}
                    className="bg-secondary text-primary px-4 py-2 rounded font-bold hover:bg-yellow-400 transition"
                >
                    + Novo Lead
                </button>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            leads={getLeadsByStatus(column.id)}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
                </DragOverlay>
            </DndContext>

            {showNewLeadModal && (
                <NewLeadModal
                    onClose={() => setShowNewLeadModal(false)}
                    onSuccess={() => {
                        setShowNewLeadModal(false);
                        fetchLeads();
                    }}
                />
            )}
        </Layout>
    );
}

function KanbanColumn({ id, title, color, leads }: { id: string; title: string; color: string; leads: Lead[] }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex flex-col min-w-[280px]">
            <div className={`${color} border-2 rounded-t-lg p-3 font-semibold text-gray-700 flex justify-between items-center`}>
                <span>{title}</span>
                <span className="bg-white px-2 py-1 rounded text-sm">{leads.length}</span>
            </div>
            <div className="bg-gray-50 border-2 border-t-0 border-gray-200 rounded-b-lg p-2 min-h-[500px] space-y-2">
                {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                ))}
            </div>
        </div>
    );
}

function LeadCard({ lead, isDragging = false }: { lead: Lead; isDragging?: boolean }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,

        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white p-3 rounded-lg shadow border border-gray-200 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <h3 className="font-semibold text-gray-800 mb-1">{lead.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{lead.phone}</p>
            {lead.source && (
                <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {lead.source}
                </span>
            )}
            {lead.notes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lead.notes}</p>
            )}
        </div>
    );
}

function NewLeadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to create lead', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Novo Lead</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone *</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Origem</label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Facebook, Site, Indicação..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-purple-800"
                        >
                            Criar Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Import missing hooks
import { useDraggable, useDroppable } from '@dnd-kit/core';
