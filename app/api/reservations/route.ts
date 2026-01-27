import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { name, email, phone, date, time, guests, tableType, notes } = body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Insert reservation into Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          name,
          email,
          phone,
          date,
          time,
          guests: guests || 2,
          table_type: tableType || 'general',
          notes: notes || null,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: 'Error al guardar la reservación' },
        { status: 500 }
      );
    }

    // Optional: Send confirmation email here
    // await sendConfirmationEmail(email, data);

    return NextResponse.json({
      success: true,
      message: 'Reservación creada exitosamente',
      reservation: data,
    });
  } catch (error) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Fetch reservations (for admin panel)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    // Filter by date if provided
    if (date) {
      query = query.eq('date', date);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: 'Error al obtener reservaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: data });
  } catch (error) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH: Update reservation status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID y status son requeridos' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la reservación' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservación actualizada',
      reservation: data,
    });
  } catch (error) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
