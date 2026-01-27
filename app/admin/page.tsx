'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalReservations: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  completedCount: number;
  totalGuests: number;
  reservationsByDay: { date: string; count: number }[];
  reservationsByTableType: { type: string; count: number }[];
  pendingReservations: any[];
}

const COLORS = ['#fff', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Cargando...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-red-500">Error al cargar estadísticas</div>
    );
  }

  const pieData = stats.reservationsByTableType.map(item => ({
    name: item.type === 'general' ? 'General' : item.type === 'vip' ? 'VIP' : 'Booth',
    value: item.count
  }));

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Reservaciones"
          value={stats.totalReservations}
          icon="📊"
        />
        <StatsCard
          title="Confirmadas"
          value={stats.confirmedCount}
          icon="✅"
          color="text-emerald-500"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingCount}
          icon="⏳"
          color="text-yellow-500"
        />
        <StatsCard
          title="Total Invitados"
          value={stats.totalGuests}
          icon="👥"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Reservations by Day */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4">Reservaciones por Día</h3>
          <div className="h-64">
            {stats.reservationsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.reservationsByDay}>
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#fff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - By Table Type */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4">Por Tipo de Mesa</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reservations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Reservaciones Pendientes</h3>
        {stats.pendingReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-zinc-500 text-sm border-b border-zinc-800">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Teléfono</th>
                  <th className="pb-3">Personas</th>
                  <th className="pb-3">Mesa</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingReservations.map((res) => (
                  <tr key={res.id} className="border-b border-zinc-800/50 text-zinc-300">
                    <td className="py-3">{new Date(res.date).toLocaleDateString('es-MX')}</td>
                    <td className="py-3">{res.name}</td>
                    <td className="py-3">{res.phone}</td>
                    <td className="py-3">{res.guests}</td>
                    <td className="py-3 capitalize">{res.table_type || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-zinc-500">No hay reservaciones pendientes</p>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color = 'text-white' }: {
  title: string;
  value: number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
