import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch hero images (max 4)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('order_index', { ascending: true })
      .limit(4);

    if (error) throw error;

    return NextResponse.json({ images: data });
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}

// POST - Add new hero image
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if we already have 4 images
    const { count } = await supabase
      .from('hero_images')
      .select('*', { count: 'exact', head: true });

    if (count && count >= 4) {
      return NextResponse.json(
        { error: 'Maximum 4 images allowed. Delete one first.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('hero_images')
      .insert([{
        image_url: body.image_url,
        order_index: body.order_index || count || 0
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error) {
    console.error('Error adding hero image:', error);
    return NextResponse.json({ error: 'Error adding image' }, { status: 500 });
  }
}

// PATCH - Update hero image
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('hero_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error) {
    console.error('Error updating hero image:', error);
    return NextResponse.json({ error: 'Error updating image' }, { status: 500 });
  }
}

// DELETE - Delete hero image
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('hero_images')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero image:', error);
    return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
  }
}
