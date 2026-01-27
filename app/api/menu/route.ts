import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch menu items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    let query = supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (available === 'true') {
      query = query.eq('available', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al obtener el menú' }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Menu API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Create menu item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, name, description, price, image_url, available } = body;

    if (!category || !name || price === undefined) {
      return NextResponse.json({ error: 'Categoría, nombre y precio son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        category,
        name,
        description: description || null,
        price,
        image_url: image_url || null,
        available: available !== false
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al crear el item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Menu API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Update menu item
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al actualizar el item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Menu API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Delete menu item
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Error al eliminar el item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
