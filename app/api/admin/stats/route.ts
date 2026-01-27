import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get basic stats
    const { data: allReservations, error: resError } = await supabase
      .from('reservations')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (resError) {
      console.error('Stats Error:', resError);
      return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
    }

    const reservations = allReservations || [];

    // Calculate stats
    const totalReservations = reservations.length;
    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
    const pendingCount = reservations.filter(r => r.status === 'pending').length;
    const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
    const completedCount = reservations.filter(r => r.status === 'completed').length;
    const totalGuests = reservations.reduce((sum, r) => sum + (r.guests || 0), 0);

    // Reservations by day
    const byDay: { [key: string]: number } = {};
    reservations.forEach(r => {
      byDay[r.date] = (byDay[r.date] || 0) + 1;
    });
    const reservationsByDay = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Reservations by table type
    const byType: { [key: string]: number } = {};
    reservations.forEach(r => {
      const type = r.table_type || 'general';
      byType[type] = (byType[type] || 0) + 1;
    });
    const reservationsByTableType = Object.entries(byType)
      .map(([type, count]) => ({ type, count }));

    // Pending reservations list
    const { data: pendingList } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', 'pending')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10);

    return NextResponse.json({
      totalReservations,
      confirmedCount,
      pendingCount,
      cancelledCount,
      completedCount,
      totalGuests,
      reservationsByDay,
      reservationsByTableType,
      pendingReservations: pendingList || []
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
