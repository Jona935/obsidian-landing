import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all categories
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      // If table doesn't exist, return default categories
      if (error.code === '42P01') {
        return NextResponse.json({
          categories: [
            { id: 'cocktails', name: 'Cócteles', display_order: 1 },
            { id: 'shots', name: 'Shots', display_order: 2 },
            { id: 'bottles', name: 'Botellas', display_order: 3 },
            { id: 'food', name: 'Comida', display_order: 4 },
            { id: 'specials', name: 'Especiales', display_order: 5 },
          ]
        });
      }
      throw error;
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error fetching categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, display_order } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ id: slug, name, display_order: display_order || 99 }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category: data });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error creating category' },
      { status: 500 }
    );
  }
}

// PATCH - Update category
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category: data });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Error updating category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    // Check if category has items
    const { data: items } = await supabase
      .from('menu_items')
      .select('id')
      .eq('category', id)
      .limit(1);

    if (items && items.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con items. Mueve o elimina los items primero.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error deleting category' },
      { status: 500 }
    );
  }
}
