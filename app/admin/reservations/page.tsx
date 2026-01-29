'use client';

import { useState, useEffect } from 'react';

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table_type: string;
  notes: string;
  status: string;
  created_at: string;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-emerald-500/20 text-emerald-500',
  cancelled: 'bg-red-500/20 text-red-500',
  completed: 'bg-zinc-500/20 text-zinc-400',
};

const statusLabels: { [key: string]: string } = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const downloadExcel = () => {
    if (reservations.length === 0) return;

    // CSV headers
    const headers = ['Fecha', 'Hora', 'Nombre', 'Email', 'Teléfono', 'Personas', 'Tipo de Mesa', 'Notas', 'Estado', 'Creada'];

    // CSV rows
    const rows = reservations.map(r => [
      new Date(r.date + 'T12:00:00').toLocaleDateString('es-MX'),
      r.time,
      r.name,
      r.email,
      r.phone,
      r.guests.toString(),
      r.table_type || 'general',
      r.notes || '',
      statusLabels[r.status] || r.status,
      new Date(r.created_at).toLocaleString('es-MX')
    ]);

    // Build CSV content with BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `reservaciones_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, filterDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterDate) params.append('date', filterDate);

      const res = await fetch(`/api/reservations?${params}`);
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setReservations(prev =>
          prev.map(r => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendWhatsApp = (reservation: Reservation) => {
    // Clean phone number (remove spaces, dashes, etc)
    const phone = reservation.phone.replace(/\D/g, '');
    // Add Mexico country code if not present
    const fullPhone = phone.startsWith('52') ? phone : `52${phone}`;

    const date = new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `¡Hola ${reservation.name}! 👋

Recibimos tu reservación en *Obsidian Social Club* para el *${date}* para *${reservation.guests} ${reservation.guests === 1 ? 'persona' : 'personas'}*.

¿Te confirmamos la reservación? 🎉`;

    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif text-white">Reservaciones</h1>
        <button
          onClick={downloadExcel}
          disabled={reservations.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">Descargar Excel</span>
          <span className="sm:hidden">Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 sm:flex-none">
          <label className="block text-zinc-500 text-xs sm:text-sm mb-1 sm:mb-2">Filtrar por estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-white px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:border-white text-sm"
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
        <div className="flex-1 sm:flex-none">
          <label className="block text-zinc-500 text-xs sm:text-sm mb-1 sm:mb-2">Filtrar por fecha</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-white px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:border-white text-sm"
          />
        </div>
        {(filterStatus || filterDate) && (
          <div className="flex items-end">
            <button
              onClick={() => { setFilterStatus(''); setFilterDate(''); }}
              className="text-zinc-500 hover:text-white px-3 sm:px-4 py-2 text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Cargando...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No hay reservaciones</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-zinc-500 text-sm bg-zinc-950">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Personas</th>
                  <th className="px-4 py-3">Mesa</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-4 py-4">{new Date(res.date + 'T12:00:00').toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-4">{res.time}</td>
                    <td className="px-4 py-4 text-white">{res.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span>{res.phone}</span>
                        {res.status === 'pending' && (
                          <button
                            onClick={() => sendWhatsApp(res)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">{res.guests}</td>
                    <td className="px-4 py-4 capitalize">{res.table_type || 'General'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusColors[res.status]}`}>
                        {statusLabels[res.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={res.status}
                        onChange={(e) => updateStatus(res.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white text-sm px-2 py-1 rounded focus:outline-none"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmar</option>
                        <option value="cancelled">Cancelar</option>
                        <option value="completed">Completada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Cargando...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No hay reservaciones</div>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => (
              <div key={res.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium">{res.name}</h3>
                    <p className="text-zinc-500 text-sm">{res.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[res.status]}`}>
                    {statusLabels[res.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-zinc-500">Fecha:</span>
                    <span className="text-zinc-300 ml-1">{new Date(res.date + 'T12:00:00').toLocaleDateString('es-MX')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Hora:</span>
                    <span className="text-zinc-300 ml-1">{res.time}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Personas:</span>
                    <span className="text-zinc-300 ml-1">{res.guests}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Mesa:</span>
                    <span className="text-zinc-300 ml-1 capitalize">{res.table_type || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <select
                    value={res.status}
                    onChange={(e) => updateStatus(res.id, e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-2 py-2 rounded focus:outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmar</option>
                    <option value="cancelled">Cancelar</option>
                    <option value="completed">Completada</option>
                  </select>
                  {res.status === 'pending' && (
                    <button
                      onClick={() => sendWhatsApp(res)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      title="Enviar WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
