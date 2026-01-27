'use client';

import { useState, useRef, useEffect } from 'react';

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableType: string;
  notes: string;
}

// Obsidian Logo Component
const ObsidianLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 400 100" className={className}>
    <defs>
      <pattern id="crackTexture" patternUnits="userSpaceOnUse" width="100" height="100">
        <rect fill="#fff" width="100" height="100"/>
        <path d="M10 0 L15 20 L5 40 L20 60 L10 80 L15 100" stroke="#1a1a1a" strokeWidth="0.5" fill="none" opacity="0.3"/>
        <path d="M50 0 L45 30 L55 50 L40 70 L50 100" stroke="#1a1a1a" strokeWidth="0.5" fill="none" opacity="0.3"/>
        <path d="M80 0 L85 25 L75 45 L90 65 L80 100" stroke="#1a1a1a" strokeWidth="0.5" fill="none" opacity="0.3"/>
      </pattern>
      <mask id="textMask">
        <rect width="100%" height="100%" fill="url(#crackTexture)"/>
      </mask>
    </defs>
    <text x="200" y="55" textAnchor="middle" fill="white" fontFamily="serif" fontSize="48" fontWeight="400" letterSpacing="8">
      OBSIDIAN
    </text>
    {/* Diamond in O */}
    <path d="M58 45 L63 55 L58 65 L53 55 Z" fill="black" stroke="white" strokeWidth="1"/>
    <text x="200" y="85" textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="14" letterSpacing="6" opacity="0.9">
      SOCIAL CLUB
    </text>
  </svg>
);

// Chatbot Component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Bienvenido a Obsidian Social Club! 🖤 Soy tu asistente virtual. Puedo ayudarte con:\n\n• Reservaciones de mesa\n• Información de próximos DJs\n• Nuestro menú de bebidas\n• Horarios y ubicación\n\n¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reservationMade, setReservationMade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    console.log('Toggle chat, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  const processReservation = async (jsonData: string) => {
    try {
      const reservationData = JSON.parse(jsonData);
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reservationData,
          email: reservationData.phone + '@chat.obsidian.com',
          time: '22:00',
          notes: 'Reservación via chat'
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error processing reservation:', error);
      return false;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages
        }),
      });

      const data = await response.json();
      let botResponse = data.response;

      // Check if response contains reservation data (only process if not already made)
      const reservationMatch = botResponse.match(/\[RESERVACION_DATA\]([\s\S]*?)\[\/RESERVACION_DATA\]/);
      if (reservationMatch) {
        // Remove the JSON block from the displayed message
        botResponse = botResponse.replace(/\[RESERVACION_DATA\][\s\S]*?\[\/RESERVACION_DATA\]/, '').trim();

        // Only process if no reservation has been made in this session
        if (!reservationMade) {
          const jsonData = reservationMatch[1].trim();
          const success = await processReservation(jsonData);

          if (success) {
            setReservationMade(true);
            botResponse += '\n\n✅ ¡Tu reservación ha sido registrada exitosamente! Te contactaremos pronto para confirmar.';
          } else {
            botResponse += '\n\n⚠️ Hubo un problema al registrar tu reservación. Por favor usa el formulario de la página o llámanos.';
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo o contáctanos directamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Button */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        {isOpen ? (
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '16px',
          height: '16px',
          backgroundColor: '#10b981',
          borderRadius: '50%'
        }}></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          width: '384px',
          height: '500px',
          backgroundColor: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #27272a', backgroundColor: 'rgba(24,24,27,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'black', fontWeight: 'bold', fontFamily: 'serif' }}>O</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 500, color: 'white' }}>Obsidian Assistant</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>Responde en segundos</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '12px',
                  borderRadius: '16px',
                  backgroundColor: msg.role === 'user' ? 'white' : '#27272a',
                  color: msg.role === 'user' ? 'black' : '#f4f4f5'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#27272a', padding: '12px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#71717a', borderRadius: '50%' }}></span>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#71717a', borderRadius: '50%' }}></span>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#71717a', borderRadius: '50%' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu mensaje..."
                style={{
                  flex: 1,
                  backgroundColor: '#27272a',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isLoading}
                style={{
                  padding: '0 16px',
                  backgroundColor: 'white',
                  color: 'black',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Types for dynamic data
interface Event {
  id: string;
  dj_name: string;
  event_date: string;
  event_time: string;
  genre: string;
  image_url: string | null;
  spotify_url: string | null;
  featured: boolean;
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
}

// Main Page Component
export default function ObsidianLanding() {
  const [formData, setFormData] = useState<ReservationForm>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '22:00',
    guests: 2,
    tableType: 'general',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Fetch dynamic data
  useEffect(() => {
    // Fetch upcoming events
    fetch('/api/events?upcoming=true')
      .then(res => res.json())
      .then(data => setUpcomingEvents((data.events || []).slice(0, 3)))
      .catch(console.error);

    // Fetch menu items
    fetch('/api/menu?available=true')
      .then(res => res.json())
      .then(data => setMenuItems(data.items || []))
      .catch(console.error);
  }, []);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: '', email: '', phone: '', date: '', time: '22:00',
          guests: 2, tableType: 'general', notes: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).toUpperCase();
  };

  // Get menu items by category
  const getMenuByCategory = (category: string) =>
    menuItems.filter(item => item.category === category).slice(0, 2);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <ObsidianLogo className="h-12 w-auto" />
          <div className="hidden md:flex items-center gap-8 text-sm tracking-wider">
            <a href="#inicio" className="text-zinc-400 hover:text-white transition-colors">INICIO</a>
            <a href="#eventos" className="text-zinc-400 hover:text-white transition-colors">EVENTOS</a>
            <a href="#menu" className="text-zinc-400 hover:text-white transition-colors">MENÚ</a>
            <a href="#galeria" className="text-zinc-400 hover:text-white transition-colors">GALERÍA</a>
            <a href="#reservar" className="bg-white text-black px-6 py-2 hover:bg-zinc-200 transition-colors">RESERVAR</a>
          </div>
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
        
        {/* Decorative lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-6">
          <div className="mb-8 animate-fadeIn">
            <img 
              src="/logo.png" 
              alt="Obsidian Social Club" 
              className="h-32 md:h-40 mx-auto"
            />
          </div>
          <p className="text-zinc-400 text-lg md:text-xl tracking-[0.3em] mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            DONDE LA NOCHE COBRA VIDA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <a href="#reservar" className="px-8 py-4 bg-white text-black font-medium tracking-wider hover:bg-zinc-200 transition-all hover:scale-105">
              RESERVAR MESA
            </a>
            <a href="#eventos" className="px-8 py-4 border border-zinc-700 text-white font-medium tracking-wider hover:border-white transition-all">
              VER EVENTOS
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Upcoming Events / DJs */}
      <section id="eventos" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-500 tracking-[0.3em] text-sm mb-4">PRÓXIMAMENTE</p>
            <h2 className="text-4xl md:text-5xl font-serif">LINE UP</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="group relative overflow-hidden bg-zinc-900 aspect-[3/4]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.dj_name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                      <span className="text-6xl text-zinc-700">{event.dj_name[0]}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <p className="text-zinc-400 text-sm tracking-wider mb-2">{formatEventDate(event.event_date)}</p>
                    <h3 className="text-2xl font-bold mb-1">{event.dj_name}</h3>
                    <p className="text-zinc-500">{event.genre}</p>
                    {event.spotify_url && (
                      <a
                        href={event.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-green-500 text-sm hover:text-green-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Escuchar en Spotify
                      </a>
                    )}
                  </div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-white/20 transition-all duration-500 z-10 pointer-events-none"></div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-zinc-500">
                Próximamente anunciaremos nuevos eventos
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-zinc-500 tracking-[0.3em] text-sm mb-4">NUESTRA CARTA</p>
              <h2 className="text-4xl md:text-5xl font-serif mb-6">MENÚ</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Descubre nuestra selección de cócteles signature, shots especiales y botellas premium. 
                Cada bebida está cuidadosamente elaborada para complementar tu experiencia en Obsidian.
              </p>
              <div className="flex gap-4">
                <a href="/menu" className="px-6 py-3 bg-white text-black tracking-wider hover:bg-zinc-200 transition-colors">
                  VER MENÚ COMPLETO
                </a>
                <a href="/menu.pdf" target="_blank" className="px-6 py-3 border border-zinc-700 text-white tracking-wider hover:border-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  DESCARGAR PDF
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {getMenuByCategory('cocktails').map((item, i) => (
                  <div key={item.id} className={`bg-zinc-900 p-6 border-l-2 ${i === 0 ? 'border-white' : 'border-zinc-700'}`}>
                    <p className="text-zinc-500 text-sm mb-2 uppercase">{item.category}</p>
                    <h4 className="font-medium mb-1">{item.name}</h4>
                    <p className="text-zinc-400 text-sm">{item.description}</p>
                    <p className="text-white mt-2">${item.price}</p>
                  </div>
                ))}
                {getMenuByCategory('cocktails').length === 0 && (
                  <>
                    <div className="bg-zinc-900 p-6 border-l-2 border-white">
                      <p className="text-zinc-500 text-sm mb-2">SIGNATURE</p>
                      <h4 className="font-medium mb-1">Obsidian Noir</h4>
                      <p className="text-zinc-400 text-sm">Vodka, licor de mora, espuma de carbón</p>
                      <p className="text-white mt-2">$180</p>
                    </div>
                    <div className="bg-zinc-900 p-6 border-l-2 border-zinc-700">
                      <p className="text-zinc-500 text-sm mb-2">PREMIUM</p>
                      <h4 className="font-medium mb-1">Midnight Martini</h4>
                      <p className="text-zinc-400 text-sm">Gin, vermouth, aceitunas negras</p>
                      <p className="text-white mt-2">$160</p>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-4 mt-8">
                {getMenuByCategory('shots').map((item, i) => (
                  <div key={item.id} className={`bg-zinc-900 p-6 border-l-2 ${i === 0 ? 'border-zinc-700' : 'border-white'}`}>
                    <p className="text-zinc-500 text-sm mb-2 uppercase">{item.category}</p>
                    <h4 className="font-medium mb-1">{item.name}</h4>
                    <p className="text-zinc-400 text-sm">{item.description}</p>
                    <p className="text-white mt-2">${item.price}</p>
                  </div>
                ))}
                {getMenuByCategory('shots').length === 0 && (
                  <>
                    <div className="bg-zinc-900 p-6 border-l-2 border-zinc-700">
                      <p className="text-zinc-500 text-sm mb-2">CLÁSICO</p>
                      <h4 className="font-medium mb-1">Old Fashioned</h4>
                      <p className="text-zinc-400 text-sm">Bourbon, angostura, naranja</p>
                      <p className="text-white mt-2">$150</p>
                    </div>
                    <div className="bg-zinc-900 p-6 border-l-2 border-white">
                      <p className="text-zinc-500 text-sm mb-2">SHOTS</p>
                      <h4 className="font-medium mb-1">Black Diamond</h4>
                      <p className="text-zinc-400 text-sm">Tequila, licor de café, crema</p>
                      <p className="text-white mt-2">$90</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="galeria" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-500 tracking-[0.3em] text-sm mb-4">MOMENTOS</p>
            <h2 className="text-4xl md:text-5xl font-serif">GALERÍA</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-zinc-900 overflow-hidden group cursor-pointer">
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <span className="text-zinc-700 text-sm">Imagen {i}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/galeria" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors tracking-wider">
              VER MÁS FOTOS
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Reservation Form */}
      <section id="reservar" className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-500 tracking-[0.3em] text-sm mb-4">ASEGURA TU LUGAR</p>
            <h2 className="text-4xl md:text-5xl font-serif">RESERVACIONES</h2>
          </div>

          {submitSuccess ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium mb-4">¡Reservación Enviada!</h3>
              <p className="text-zinc-400 mb-8">Te contactaremos pronto para confirmar tu reservación.</p>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="px-6 py-3 border border-zinc-700 text-white hover:border-white transition-colors"
              >
                HACER OTRA RESERVACIÓN
              </button>
            </div>
          ) : (
            <form onSubmit={handleReservation} className="bg-zinc-900 p-8 md:p-12 border border-zinc-800">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">NOMBRE COMPLETO</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">TELÉFONO</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">NÚMERO DE PERSONAS</label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  >
                    {[2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => (
                      <option key={n} value={n}>{n} personas</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">FECHA</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">HORA</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="21:00">9:00 PM</option>
                    <option value="22:00">10:00 PM</option>
                    <option value="23:00">11:00 PM</option>
                    <option value="00:00">12:00 AM</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">TIPO DE MESA</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'general', name: 'General', price: 'Sin mínimo' },
                      { id: 'vip', name: 'VIP', price: 'Mínimo $3,000' },
                      { id: 'booth', name: 'Booth Privado', price: 'Mínimo $8,000' },
                    ].map((table) => (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, tableType: table.id })}
                        className={`p-4 border text-center transition-all ${
                          formData.tableType === table.id
                            ? 'border-white bg-white/5'
                            : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <p className="font-medium mb-1">{table.name}</p>
                        <p className="text-zinc-500 text-sm">{table.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-sm mb-2 tracking-wider">NOTAS ADICIONALES</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                    placeholder="Ocasión especial, requerimientos especiales, etc."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR RESERVACIÓN'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Social & Contact */}
      <section className="py-16 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Location */}
            <div>
              <h4 className="text-zinc-500 text-sm tracking-wider mb-4">UBICACIÓN</h4>
              <p className="text-white mb-2">Av. Principal #123</p>
              <p className="text-zinc-400">Centro, Monclova, Coahuila</p>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-zinc-500 text-sm tracking-wider mb-4">HORARIOS</h4>
              <p className="text-white mb-2">Viernes & Sábado</p>
              <p className="text-zinc-400">10:00 PM - 4:00 AM</p>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-zinc-500 text-sm tracking-wider mb-4">SÍGUENOS</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <ObsidianLogo className="h-8 w-auto opacity-50" />
          <p className="text-zinc-600 text-sm">© 2025 Obsidian Social Club. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />

      {/* Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
