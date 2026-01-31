import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    const upcoming = searchParams.get('upcoming');

    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (upcoming === 'true') {
      // Use Mexico timezone to get correct "today" date
      const now = new Date();
      const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
      const today = mexicoTime.getFullYear() + '-' +
        String(mexicoTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(mexicoTime.getDate()).padStart(2, '0');
      query = query.gte('event_date', today);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error('Events API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Create event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dj_name, event_date, event_time, genre, image_url, spotify_url, featured } = body;

    if (!dj_name || !event_date) {
      return NextResponse.json({ error: 'Nombre del DJ y fecha son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{
        dj_name,
        event_date,
        event_time: event_time || null,
        genre: genre || null,
        image_url: image_url || null,
        spotify_url: spotify_url || null,
        featured: featured || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al crear el evento' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Events API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Update event
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al actualizar el evento' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Events API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Delete event
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al eliminar el evento' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Events API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
