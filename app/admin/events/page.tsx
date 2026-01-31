'use client';

import { useState, useEffect, useRef } from 'react';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  dj_name: string;
  event_date: string;
  event_time: string;
  genre: string;
  image_url: string;
  spotify_url: string;
  promotion: string;
  featured: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    dj_name: '',
    event_date: '',
    event_time: '22:00',
    genre: '',
    image_url: '',
    spotify_url: '',
    promotion: '',
    featured: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        subtitle: event.subtitle || '',
        dj_name: event.dj_name,
        event_date: event.event_date,
        event_time: event.event_time || '22:00',
        genre: event.genre || '',
        image_url: event.image_url || '',
        spotify_url: event.spotify_url || '',
        promotion: event.promotion || '',
        featured: event.featured,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        subtitle: '',
        dj_name: '',
        event_date: '',
        event_time: '22:00',
        genre: '',
        image_url: '',
        spotify_url: '',
        promotion: '',
        featured: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que la fecha no sea anterior a hoy
    const today = getTodayDate();
    if (formData.event_date < today) {
      alert('No puedes crear eventos en fechas pasadas');
      return;
    }

    const payload = {
      ...formData,
      ...(editingEvent && { id: editingEvent.id }),
    };

    try {
      const res = await fetch('/api/events', {
        method: editingEvent ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchEvents();
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (event: Event) => {
    try {
      const res = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, featured: !event.featured }),
      });

      if (res.ok) {
        setEvents(prev =>
          prev.map(e => (e.id === event.id ? { ...e, featured: !e.featured } : e))
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).toUpperCase();
  };

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Subir imagen a Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'events');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-white">Eventos / DJs</h1>
        <button
          onClick={() => openModal()}
          className="bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-brand-red-light transition-colors"
        >
          + Agregar Evento
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-zinc-500 text-center py-8">Cargando...</div>
      ) : events.length === 0 ? (
        <div className="text-zinc-500 text-center py-8">No hay eventos programados</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-brand-red/40 transition-colors"
            >
              {/* Header with date */}
              <div className="bg-zinc-950 px-4 py-3 flex items-center justify-between">
                <span className="text-brand-gold font-bold">{formatDate(event.event_date)}</span>
                {event.featured && (
                  <span className="bg-brand-gold/20 text-brand-gold text-xs px-2 py-1 rounded">
                    Destacado
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-white text-xl font-bold mb-1">{event.title || event.dj_name}</h3>

                {/* Subtitle */}
                {event.subtitle && (
                  <p className="text-brand-gold text-sm italic mb-2">{event.subtitle}</p>
                )}

                {/* DJ Name */}
                <p className="text-zinc-300 text-sm mb-1">
                  <span className="text-brand-red">DJ:</span> {event.dj_name}
                </p>

                {/* Genre */}
                {event.genre && (
                  <p className="text-zinc-500 text-sm mb-2">{event.genre}</p>
                )}

                {/* Promotion */}
                {event.promotion && (
                  <div className="bg-brand-red/10 border border-brand-red/30 px-3 py-2 rounded mb-3">
                    <p className="text-brand-red text-xs">🔥 {event.promotion}</p>
                  </div>
                )}

                {/* Links */}
                {event.spotify_url && (
                  <div className="mb-4">
                    <a
                      href={event.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 text-sm hover:underline"
                    >
                      🎵 Spotify
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => toggleFeatured(event)}
                    className={`text-sm ${event.featured ? 'text-brand-gold' : 'text-zinc-500 hover:text-brand-gold'}`}
                  >
                    {event.featured ? '★ Destacado' : '☆ Destacar'}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(event)}
                      className="text-zinc-500 hover:text-white text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl text-white mb-6">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-brand-red text-sm mb-2 font-medium">Título del Evento *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  placeholder="Ej: NOCHE OBSCURA"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Subtítulo (emocional)</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  placeholder="Ej: El ritual comienza"
                />
              </div>

              {/* DJ Name */}
              <div>
                <label className="block text-brand-red text-sm mb-2 font-medium">Nombre del DJ *</label>
                <input
                  type="text"
                  value={formData.dj_name}
                  onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  placeholder="Ej: DJ ALMEDA"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-red text-sm mb-2 font-medium">Fecha *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    min={getTodayDate()}
                    className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                    required
                  />
                  <p className="text-zinc-600 text-xs mt-1">Solo se permiten fechas de hoy en adelante</p>
                </div>
                <div>
                  <label className="block text-zinc-500 text-sm mb-2">Hora</label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Género Musical</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  placeholder="Tech House, Techno, House..."
                />
              </div>

              {/* Promotion */}
              <div>
                <label className="block text-brand-gold text-sm mb-2 font-medium">🔥 Promoción (opcional)</label>
                <input
                  type="text"
                  value={formData.promotion}
                  onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: 2x1 en shots antes de las 11pm"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Imagen del Evento</label>

                {/* Preview */}
                {formData.image_url && (
                  <div className="mb-3 relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Subir Imagen
                      </>
                    )}
                  </label>
                </div>
                <p className="text-zinc-600 text-xs mt-2">JPG, PNG, WebP o GIF. Máximo 5MB</p>
              </div>

              {/* Spotify URL */}
              <div>
                <label className="block text-zinc-500 text-sm mb-2">🎵 Spotify URL</label>
                <input
                  type="url"
                  value={formData.spotify_url}
                  onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-red"
                  placeholder="https://open.spotify.com/..."
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-brand-gold"
                />
                <label htmlFor="featured" className="text-brand-gold">★ Evento destacado</label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-zinc-700 text-white py-2 rounded-lg hover:border-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-red text-white py-2 rounded-lg hover:bg-brand-red-light transition-colors font-medium"
                >
                  {editingEvent ? 'Guardar' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
