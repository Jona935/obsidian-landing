'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Subir imagen a Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 4) {
      alert('Máximo 4 imágenes permitidas');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'hero');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Agregar la imagen directamente
        const addRes = await fetch('/api/hero-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: data.url }),
        });

        if (addRes.ok) {
          fetchImages();
        } else {
          const addData = await addRes.json();
          alert(addData.error || 'Error al agregar imagen');
        }
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

          {/* Upload Button */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="hero-image-upload"
            />
            <label
              htmlFor="hero-image-upload"
              className={`flex items-center justify-center gap-3 w-full bg-brand-red text-white px-6 py-4 rounded-lg cursor-pointer hover:bg-brand-red-light transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subiendo imagen...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Subir Imagen desde tu dispositivo
                </>
              )}
            </label>
            <p className="text-zinc-500 text-xs mt-2 text-center">JPG, PNG, WebP o GIF. Máximo 5MB</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-sm">o pega una URL</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* URL Input */}
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
              className="px-6 py-3 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Agregar
            </button>
          </div>
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
