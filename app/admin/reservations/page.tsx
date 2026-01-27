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
      new Date(r.date).toLocaleDateString('es-MX'),
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-white">Reservaciones</h1>
        <button
          onClick={downloadExcel}
          disabled={reservations.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-zinc-500 text-sm mb-2">Filtrar por estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
        <div>
          <label className="block text-zinc-500 text-sm mb-2">Filtrar por fecha</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
          />
        </div>
        {(filterStatus || filterDate) && (
          <div className="flex items-end">
            <button
              onClick={() => { setFilterStatus(''); setFilterDate(''); }}
              className="text-zinc-500 hover:text-white px-4 py-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
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
                    <td className="px-4 py-4">{new Date(res.date).toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-4">{res.time}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white">{res.name}</p>
                        <p className="text-zinc-500 text-sm">{res.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{res.phone}</td>
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
    </div>
  );
}
