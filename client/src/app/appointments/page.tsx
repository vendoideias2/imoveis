'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Appointment {
    id: string;
    title: string;
    description: string;
    scheduledAt: string;
    duration: number;
    status: string;
    lead?: { name: string; phone: string };
    property?: { title: string; city: string };
    user?: { name: string };
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Appointment;
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<View>('month');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60,
        leadId: '',
        propertyId: '',
        status: 'SCHEDULED'
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        // Convert appointments to calendar events
        const calendarEvents: CalendarEvent[] = appointments.map(apt => {
            const start = new Date(apt.scheduledAt);
            const end = new Date(start.getTime() + apt.duration * 60000);

            return {
                id: apt.id,
                title: apt.title,
                start,
                end,
                resource: apt
            };
        });
        setEvents(calendarEvents);
    }, [appointments]);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/appointments');
            const data = await res.json();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    };

    const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
        setSelectedDate(slotInfo.start);
        setFormData({
            ...formData,
            scheduledAt: moment(slotInfo.start).format('YYYY-MM-DDTHH:mm')
        });
        setShowModal(true);
    }, [formData]);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        const apt = event.resource;
        if (confirm(`${apt.title}\n\nDeseja excluir este agendamento?`)) {
            deleteAppointment(apt.id);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchAppointments();
                setShowModal(false);
                setFormData({
                    title: '',
                    description: '',
                    scheduledAt: '',
                    duration: 60,
                    leadId: '',
                    propertyId: '',
                    status: 'SCHEDULED'
                });
            }
        } catch (error) {
            console.error('Error creating appointment', error);
        }
    };

    const deleteAppointment = async (id: string) => {
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error deleting appointment', error);
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const apt = event.resource;
        let backgroundColor = '#5D0085'; // Primary purple

        if (apt.status === 'COMPLETED') backgroundColor = '#10B981'; // Green
        if (apt.status === 'CANCELLED') backgroundColor = '#EF4444'; // Red
        if (apt.status === 'NO_SHOW') backgroundColor = '#F59E0B'; // Orange

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Agenda de Visitas</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-purple-800 transition"
                >
                    + Novo Agendamento
                </button>
            </div>

            {/* Legend */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5D0085' }}></div>
                    <span>Agendado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span>Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>Cancelado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span>Não Compareceu</span>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg shadow" style={{ height: '700px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    view={view}
                    onView={setView}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: 'Próximo',
                        previous: 'Anterior',
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Hora',
                        event: 'Evento',
                        noEventsInRange: 'Nenhum agendamento neste período'
                    }}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Ex: Visita ao Apartamento Centro"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data e Hora *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duração (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full border rounded px-3 py-2"
                                        min="15"
                                        step="15"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        rows={3}
                                        placeholder="Detalhes do agendamento..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-purple-800"
                                    >
                                        Agendar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
