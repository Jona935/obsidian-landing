'use client';

import { useState, useEffect } from 'react';

interface HeroImage {
  id: string;
  image_url: string;
  order_index: number;
}

export default function HeroImagesPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-images');
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addImage = async () => {
    if (!newImageUrl.trim()) return;

    try {
      const res = await fetch('/api/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: newImageUrl }),
      });

      if (res.ok) {
        setNewImageUrl('');
        fetchImages();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al agregar imagen');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateImage = async (id: string) => {
    if (!editUrl.trim()) return;

    try {
      const res = await fetch('/api/hero-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, image_url: editUrl }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditUrl('');
        fetchImages();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      const res = await fetch(`/api/hero-images?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    const otherImage = images[newIndex];

    // Swap order indices
    try {
      await fetch('/api/hero-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, order_index: otherImage.order_index }),
      });

      await fetch('/api/hero-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: otherImage.id, order_index: images[currentIndex].order_index }),
      });

      fetchImages();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white">Imágenes del Hero</h1>
          <p className="text-zinc-500 text-sm mt-1">Máximo 4 imágenes para la sección principal</p>
        </div>
        <span className="text-zinc-400 text-sm">{images.length}/4 imágenes</span>
      </div>

      {/* Add new image */}
      {images.length < 4 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-white font-medium mb-4">Agregar Nueva Imagen</h2>
          <div className="flex gap-4">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL de la imagen (https://...)"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-white"
            />
            <button
              onClick={addImage}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Agregar
            </button>
          </div>
          <p className="text-zinc-600 text-xs mt-2">
            Tip: Usa URLs de Unsplash, Cloudinary, o tu propio hosting de imágenes
          </p>
        </div>
      )}

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Cargando...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg">
          <p className="mb-2">No hay imágenes</p>
          <p className="text-xs">Agrega hasta 4 imágenes para el hero</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
            >
              {/* Image Preview */}
              <div className="aspect-[3/4] relative group">
                <img
                  src={img.image_url}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">Posición {index + 1}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="p-3 space-y-2">
                {editingId === img.id ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 rounded focus:outline-none"
                      placeholder="Nueva URL"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateImage(img.id)}
                        className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded hover:bg-emerald-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditUrl(''); }}
                        className="flex-1 bg-zinc-700 text-white text-xs py-2 rounded hover:bg-zinc-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveImage(img.id, 'up')}
                      disabled={index === 0}
                      className="flex-1 bg-zinc-800 text-white text-xs py-2 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Izq
                    </button>
                    <button
                      onClick={() => moveImage(img.id, 'down')}
                      disabled={index === images.length - 1}
                      className="flex-1 bg-zinc-800 text-white text-xs py-2 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Der →
                    </button>
                  </div>
                )}

                {editingId !== img.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(img.id); setEditUrl(img.image_url); }}
                      className="flex-1 bg-zinc-800 text-white text-xs py-2 rounded hover:bg-zinc-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="flex-1 bg-red-600/20 text-red-400 text-xs py-2 rounded hover:bg-red-600/30"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Info */}
      <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <h3 className="text-white text-sm font-medium mb-2">Vista previa</h3>
        <p className="text-zinc-500 text-xs">
          Las imágenes aparecerán en el hero de la página principal, siguiendo el cursor del mouse.
          Se recomienda usar imágenes de alta calidad con relación de aspecto vertical (3:4).
        </p>
      </div>
    </div>
  );
}
