'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// Helper function for consistent price formatting (avoids hydration mismatch)
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  dj_name: string;
  event_date: string;
  event_time: string;
  genre: string;
  image_url: string | null;
  spotify_url: string | null;
  promotion: string | null;
  featured: boolean;
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  featured: boolean;
}

// Logo URL
const LOGO_URL = 'https://tdgwgxsmprjdlaaorkpm.supabase.co/storage/v1/object/public/imgs/WhatsApp_Image_2026-01-28_at_22.37.15-removebg-preview.png';

// Loading Screen - Fully Responsive and Centered
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-4 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-red/10 via-transparent to-transparent" />

      {/* Animated corner accents */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-brand-gold/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-brand-gold/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      <div className="relative text-center w-full max-w-lg flex flex-col items-center">
        {/* Logo with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-4"
        >
          <motion.img
            src={LOGO_URL}
            alt="Obsidian Social Club"
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
            animate={{
              filter: ['drop-shadow(0 0 20px rgba(196,30,58,0.5))', 'drop-shadow(0 0 50px rgba(196,30,58,0.8))', 'drop-shadow(0 0 20px rgba(196,30,58,0.5))']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          {/* OBSIDIAN text with gradient */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-center bg-gradient-to-r from-white via-brand-gold to-white bg-clip-text text-transparent"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            OBSIDIAN
          </motion.h1>

          {/* Animated red line */}
          <motion.div
            className="h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent mt-4 w-48 sm:w-56 md:w-64 lg:w-72"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          />

          {/* SOCIAL CLUB with gold color */}
          <motion.p
            className="text-brand-gold tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] text-xs sm:text-sm mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            SOCIAL CLUB
          </motion.p>
        </motion.div>

        {/* Loading dots with brand colors */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i === 1 ? 'bg-brand-gold' : 'bg-brand-red'}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: i === 1
                  ? ['0 0 5px rgba(212,175,55,0.3)', '0 0 15px rgba(212,175,55,0.6)', '0 0 5px rgba(212,175,55,0.3)']
                  : ['0 0 5px rgba(196,30,58,0.3)', '0 0 15px rgba(196,30,58,0.6)', '0 0 5px rgba(196,30,58,0.3)']
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated Section Wrapper
const AnimatedSection = ({ children, className = '', delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Magnetic Button Effect
const MagneticButton = ({ children, className = '', onClick, href }: { children: React.ReactNode; className?: string; onClick?: () => void; href?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const Component = href ? 'a' : 'button';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <Component
        href={href}
        onClick={onClick}
        className={className}
      >
        {children}
      </Component>
    </motion.div>
  );
};

// Chatbot Component
const Chatbot = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! 🖤 Bienvenido a Obsidian Social Club.\n\n¿Qué te gustaría hacer?\n\n📅 Reservar mesa\n🎵 Ver próximos eventos y DJs\n🍸 Ver menú de bebidas\n\nEscríbeme y te ayudo con lo que necesites.' }
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

      const reservationMatch = botResponse.match(/\[RESERVACION_DATA\]([\s\S]*?)\[\/RESERVACION_DATA\]/);
      if (reservationMatch) {
        botResponse = botResponse.replace(/\[RESERVACION_DATA\][\s\S]*?\[\/RESERVACION_DATA\]/, '').trim();

        if (!reservationMade) {
          const jsonData = reservationMatch[1].trim();
          const success = await processReservation(jsonData);

          if (success) {
            setReservationMade(true);
            botResponse += '\n\n✓ ¡Tu reservación ha sido registrada exitosamente!';
          } else {
            botResponse += '\n\n⚠ Hubo un problema. Intenta con el formulario.';
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-16 sm:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[340px] md:w-[380px] h-[70vh] sm:h-[450px] md:h-[500px] max-h-[500px] bg-black/95 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-5 border-b border-zinc-800">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-serif text-sm sm:text-lg">O</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm sm:text-base">Obsidian Assistant</h3>
                  <p className="text-zinc-500 text-[10px] sm:text-xs">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((msg, i) => {
                // Check for special markers
                const hasMenuButton = msg.content.includes('[MENU_BUTTON]');

                // Extract event cards
                const eventCardRegex = /\[EVENT_CARD\]([\s\S]*?)\[\/EVENT_CARD\]/g;
                const eventCards: any[] = [];
                let match;
                while ((match = eventCardRegex.exec(msg.content)) !== null) {
                  try {
                    eventCards.push(JSON.parse(match[1]));
                  } catch (e) {
                    console.error('Error parsing event card:', e);
                  }
                }

                // Clean content (remove markers)
                let cleanContent = msg.content
                  .replace(/\[MENU_BUTTON\]/g, '')
                  .replace(/\[EVENT_CARD\][\s\S]*?\[\/EVENT_CARD\]/g, '')
                  .trim();

                // Format date helper
                const formatCardDate = (dateStr: string) => {
                  const date = new Date(dateStr + 'T12:00:00');
                  return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
                };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] sm:max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-white text-black px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-br-sm'
                        : ''
                    }`}>
                      {/* Text content */}
                      {cleanContent && (
                        <div className={`${msg.role === 'assistant' ? 'bg-zinc-900 text-zinc-300 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm mb-2' : ''}`}>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap">{cleanContent}</p>
                        </div>
                      )}

                      {/* Event Cards */}
                      {eventCards.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {eventCards.map((event, idx) => (
                            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                              {/* Event Image */}
                              {event.image_url && (
                                <div className="relative h-28 sm:h-32">
                                  <img
                                    src={event.image_url}
                                    alt={event.title || event.dj_name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                  {/* Date badge on image */}
                                  <div className="absolute top-2 right-2 bg-brand-gold text-black text-[10px] font-bold px-2 py-1 rounded">
                                    {formatCardDate(event.event_date)}
                                  </div>
                                </div>
                              )}

                              {/* Event Info */}
                              <div className="p-3">
                                <h4 className="text-white font-bold text-sm mb-1">{event.title || event.dj_name}</h4>
                                <p className="text-brand-red text-xs mb-1">DJ: {event.dj_name}</p>
                                {event.genre && (
                                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">{event.genre}</p>
                                )}

                                {/* Promotion */}
                                {event.promotion && (
                                  <div className="bg-brand-red/20 border border-brand-red/30 px-2 py-1 rounded text-[10px] text-brand-red mb-2">
                                    🔥 {event.promotion}
                                  </div>
                                )}

                                {/* Spotify Button */}
                                {event.spotify_url && (
                                  <a
                                    href={event.spotify_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#1DB954] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#1ed760] transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                    </svg>
                                    Escuchar en Spotify
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Menu PDF Button */}
                      {hasMenuButton && (
                        <a
                          href="/menu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Ver Menú Completo
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-600 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-zinc-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="px-3 sm:px-4 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

// Floating Images Component - receives mouse position from parent
const FloatingImages = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const [images, setImages] = useState<{ id: string; image_url: string }[]>([]);

  useEffect(() => {
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(data => setImages(data.images || []))
      .catch(console.error);
  }, []);

  // Parallax values for each position
  const parallaxValues = [0.04, 0.06, 0.05, 0.07];

  // Default images if none in database
  const defaultImages = [
    'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400'
  ];

  const displayImages = images.length > 0
    ? images.map(img => img.image_url)
    : defaultImages;

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 justify-center mt-8 sm:mt-10 md:mt-12 px-2">
      {displayImages.slice(0, 4).map((src, index) => (
        <motion.div
          key={index}
          className="w-16 h-24 sm:w-20 sm:h-28 md:w-28 md:h-40 lg:w-36 lg:h-52 xl:w-44 xl:h-64 overflow-hidden flex-shrink-0"
          animate={{
            x: mousePosition.x * parallaxValues[index] * 300,
            y: mousePosition.y * parallaxValues[index] * 150,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 0.5
          }}
        >
          <div className="relative w-full h-full group cursor-pointer">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main Page Component
export default function ObsidianLanding() {
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', date: '', guests: 2
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [heroMousePosition, setHeroMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    fetch('/api/events?upcoming=true')
      .then(res => res.json())
      .then(data => setUpcomingEvents((data.events || []).slice(0, 3)))
      .catch(console.error);

    fetch('/api/menu?available=true')
      .then(res => res.json())
      .then(data => {
        const items = data.items || [];
        // Filter featured items, or take first 6 if no featured column exists
        const featuredItems = items.filter((item: MenuItem) => item.featured);
        setMenuItems(featuredItems.length > 0 ? featuredItems : items.slice(0, 6));
      })
      .catch(console.error);
  }, []);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: formData.phone + '@whatsapp.com', // placeholder email
          time: '22:00',
          tableType: 'general'
        }),
      });
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', phone: '', date: '', guests: 2 });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    // Agregar T12:00:00 para evitar problemas de zona horaria
    const date = new Date(dateStr + 'T12:00:00');
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase()
    };
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <main className="bg-black text-white overflow-x-hidden">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: loading ? -100 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md"
        >
          <div className="max-w-[1800px] mx-auto px-4 sm:px-8 md:px-16 py-4 sm:py-6 flex items-center justify-between">
            <motion.a
              href="#"
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <img src={LOGO_URL} alt="Obsidian" className="h-7 sm:h-8 md:h-10 w-auto" />
              <span className="text-white text-base sm:text-lg md:text-xl tracking-[0.1em] sm:tracking-[0.15em]" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>OBSIDIAN</span>
            </motion.a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-12 text-xs tracking-[0.2em]">
              <motion.a
                href="#eventos"
                className="text-white relative group"
                whileHover={{ y: -2 }}
              >
                EVENTOS
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
              </motion.a>
              <motion.a
                href="/menu"
                className="text-white relative group"
                whileHover={{ y: -2 }}
              >
                MENÚ
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
              </motion.a>
              <motion.a
                href="#reservar"
                className="text-white relative group"
                whileHover={{ y: -2 }}
              >
                RESERVAR
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
              <div className="relative h-full flex flex-col items-center justify-center gap-8">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-white p-2"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Logo in mobile menu */}
                <motion.div
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <img src={LOGO_URL} alt="Obsidian" className="h-16 w-auto" />
                  <span className="text-white text-2xl tracking-[0.15em]" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>OBSIDIAN</span>
                </motion.div>

                <motion.a
                  href="#eventos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-2xl tracking-[0.2em] font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  EVENTOS
                </motion.a>
                <motion.a
                  href="/menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-2xl tracking-[0.2em] font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  MENÚ
                </motion.a>
                <motion.a
                  href="#reservar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-2xl tracking-[0.2em] font-serif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  RESERVAR
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative h-screen flex items-center justify-center overflow-hidden"
          onMouseMove={(e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            setHeroMousePosition({
              x: (clientX - innerWidth / 2) / innerWidth,
              y: (clientY - innerHeight / 2) / innerHeight
            });
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10 pointer-events-none"
            style={{ opacity: heroOpacity }}
          />

          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-black"
            style={{ scale: heroScale, y: heroY }}
          />

          {/* Hero Content */}
          <motion.div
            className="relative z-30 text-center px-8"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 30 : 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* Logo with hover animation */}
              <motion.img
                src={LOGO_URL}
                alt="Obsidian Social Club"
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain mx-auto mb-2"
                whileHover={{ scale: 1.05, rotate: 5, transition: { duration: 0.3 } }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 15px rgba(196,30,58,0.3))',
                    'drop-shadow(0 0 35px rgba(196,30,58,0.6))',
                    'drop-shadow(0 0 15px rgba(196,30,58,0.3))'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1],
                  times: [0, 0.5, 1]
                }}
              />
              {/* OBSIDIAN text */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-none tracking-[0.05em] sm:tracking-[0.08em] md:tracking-[0.1em] mb-2 sm:mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                OBSIDIAN
              </h1>
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <span className="w-8 sm:w-12 md:w-16 h-[1px] bg-brand-red/60" />
                <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] text-brand-gold font-display">SOCIAL CLUB</span>
                <span className="w-8 sm:w-12 md:w-16 h-[1px] bg-brand-red/60" />
              </div>

              {/* CTA Button - Reservar */}
              <motion.button
                onClick={() => setChatbotOpen(true)}
                className="relative mt-6 sm:mt-8 px-8 sm:px-12 py-3 sm:py-4 bg-brand-red text-white font-barlow font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-sm sm:text-base hover:bg-brand-red-light transition-all duration-300 rounded-full overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(196,30,58,0.4)',
                    '0 0 40px rgba(196,30,58,0.7)',
                    '0 0 20px rgba(196,30,58,0.4)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Shine effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                  animate={{ translateX: ['−100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  RESERVAR AHORA
                </span>
              </motion.button>

              {/* Floating Images below title */}
              <FloatingImages mousePosition={heroMousePosition} />

              <p className="text-zinc-500 text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] mt-6 sm:mt-8 max-w-lg mx-auto px-4">
                MONCLOVA, COAH.
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator - Left side */}
          <motion.div
            className="absolute bottom-8 left-4 sm:left-8 z-20 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 bg-brand-red/20 backdrop-blur-sm px-3 py-2 rounded-full border border-brand-red/40"
            >
              <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-[10px] sm:text-xs tracking-[0.15em] text-white font-barlow font-medium">SCROLL</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Events Section */}
        <AnimatedSection className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-16 bg-black" id="eventos">
          <div className="max-w-[1800px] mx-auto">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div>
                <span className="text-brand-red text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] block mb-2 sm:mb-4 font-barlow font-medium">PRÓXIMOS EVENTOS</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display text-white mb-2">LINE UP</h2>
                <p className="text-brand-gold font-script text-xl sm:text-2xl">El ritual continúa</p>
              </div>
              <p className="text-zinc-500 text-xs sm:text-sm max-w-md mt-4 md:mt-0 leading-relaxed font-barlow">
                Los mejores artistas de la escena electrónica. No seguimos tendencias, seguimos la vibra.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => {
                  const date = formatEventDate(event.event_date);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative aspect-[3/4] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Image */}
                      <motion.div
                        className="absolute inset-0 bg-zinc-900"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      >
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.dj_name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                            <span className="text-8xl font-serif text-zinc-800">{event.dj_name[0]}</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                      {/* Content */}
                      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
                        {/* Top: Date badge + Title + Subtitle */}
                        <div>
                          {/* Date badge - Top right corner */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              {/* Title - Display font, impactful */}
                              <motion.h3
                                className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white tracking-wide mb-1"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                              >
                                {event.title || event.dj_name}
                              </motion.h3>

                              {/* Subtitle - Script font for emotion */}
                              {event.subtitle && (
                                <p className="font-script text-brand-gold text-lg sm:text-xl">{event.subtitle}</p>
                              )}
                            </div>

                            {/* Date - Top right */}
                            <div className="text-right bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-brand-gold/30">
                              <span className="block text-3xl sm:text-4xl font-display font-bold text-brand-gold leading-none">{date.day}</span>
                              <span className="text-[10px] sm:text-xs tracking-[0.15em] text-brand-gold/80 font-barlow uppercase">{date.month}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: DJ, Genre, Promotion, Spotify */}
                        <div>
                          {/* DJ Name - Barlow, featured */}
                          <p className="text-white/90 text-sm sm:text-base font-barlow font-medium mb-1">
                            <span className="text-brand-red">DJ:</span> {event.dj_name}
                          </p>

                          {/* Genre */}
                          <p className="text-zinc-500 text-xs sm:text-sm tracking-wider font-barlow uppercase mb-2">{event.genre}</p>

                          {/* Promotion - if exists */}
                          {event.promotion && (
                            <div className="bg-brand-red/20 border border-brand-red/40 px-3 py-1.5 rounded-sm mb-2 inline-block">
                              <p className="text-brand-red text-[10px] sm:text-xs font-barlow font-medium tracking-wide">
                                🔥 {event.promotion}
                              </p>
                            </div>
                          )}

                          {/* Spotify Link */}
                          {event.spotify_url && (
                            <motion.a
                              href={event.spotify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 mt-1 text-brand-gold text-[10px] sm:text-xs tracking-wider font-barlow opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                              whileHover={{ x: 5 }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                              ESCUCHAR EN SPOTIFY
                            </motion.a>
                          )}
                        </div>
                      </div>

                      {/* Border Animation */}
                      <div className="absolute inset-0 border border-brand-red/0 group-hover:border-brand-red/40 transition-colors duration-500" />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 sm:py-20 text-zinc-600">
                  <p className="text-base sm:text-lg">Próximamente anunciaremos nuevos eventos</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Marquee Divider */}
        <div className="py-8 border-y border-brand-red/20 overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap"
          >
            {Array(10).fill(null).map((_, i) => (
              <span key={i} className="text-brand-red/30 text-sm tracking-[0.5em] font-barlow">
                TECHNO • HOUSE • ELECTRONIC • UNDERGROUND • OBSIDIAN •
              </span>
            ))}
          </motion.div>
        </div>

        {/* Menu Section */}
        <AnimatedSection className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-16 bg-zinc-950" id="menu">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
              {/* Left - Title & Description */}
              <div className="md:sticky md:top-32">
                <span className="text-brand-red text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] block mb-2 sm:mb-4 font-barlow font-medium">NUESTRA CARTA</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display text-white mb-4 sm:mb-6 md:mb-8">MENÚ</h2>
                <p className="text-zinc-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md font-barlow">
                  Descubre nuestra selección de cócteles signature, shots especiales y botellas premium.
                  Cada bebida está cuidadosamente elaborada para complementar tu experiencia.
                </p>
                <a
                  href="/menu"
                  className="inline-flex items-center gap-2 sm:gap-3 text-brand-red text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] group hover:text-brand-red-light transition-colors font-barlow font-semibold"
                >
                  VER MENÚ COMPLETO
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>

              {/* Right - Menu Items */}
              <div className="space-y-12">
                {/* Featured Items */}
                <div>
                  <h3 className="text-xs tracking-[0.3em] text-brand-gold mb-6 pb-2 border-b border-brand-gold/30 flex items-center gap-2 font-barlow">
                    <span className="text-brand-gold">⭐</span> DESTACADOS
                  </h3>
                  <div className="space-y-6">
                    {(menuItems.length > 0 ? menuItems.slice(0, 6) : [
                      { id: '1', name: 'Obsidian Noir', description: 'Vodka, licor de mora, espuma de carbón', price: 180, category: 'cocktails', featured: true },
                      { id: '2', name: 'Midnight Martini', description: 'Gin, vermouth, aceitunas negras', price: 160, category: 'cocktails', featured: true },
                      { id: '3', name: 'Grey Goose', description: 'Vodka francés premium 750ml', price: 2500, category: 'bottles', featured: true },
                    ]).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-start group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium group-hover:text-zinc-300 transition-colors">{item.name}</h4>
                            {item.featured && <span className="text-brand-gold text-sm">⭐</span>}
                          </div>
                          <p className="text-zinc-600 text-sm">{item.description}</p>
                          <span className="text-zinc-700 text-xs uppercase tracking-wider">{
                            item.category === 'cocktails' ? 'Cóctel' :
                            item.category === 'shots' ? 'Shot' :
                            item.category === 'bottles' ? 'Botella' :
                            item.category === 'food' ? 'Comida' :
                            'Especial'
                          }</span>
                        </div>
                        <span className="text-white ml-4">${formatPrice(item.price)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Reservation Section */}
        <AnimatedSection className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-16 bg-black" id="reservar">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <span className="text-brand-red text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] block mb-2 sm:mb-4 font-barlow font-medium">ASEGURA TU LUGAR</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display text-white">RESERVAR</h2>
            </div>

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 border border-brand-red/30"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 border border-brand-gold rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <svg className="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-display text-brand-gold mb-4">RESERVACIÓN ENVIADA</h3>
                  <p className="text-zinc-500 mb-8 font-barlow">Te contactaremos por WhatsApp para confirmar.</p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs tracking-[0.2em] text-brand-red hover:text-brand-red-light transition-colors font-barlow"
                  >
                    NUEVA RESERVACIÓN
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleReservation}
                  className="border border-brand-red/30 p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl mx-auto"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div>
                      <label className="block text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 mb-2 sm:mb-3">NOMBRE</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre"
                        className="w-full bg-transparent border-b border-zinc-800 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 mb-2 sm:mb-3">WHATSAPP</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ej: 866 123 4567"
                        className="w-full bg-transparent border-b border-zinc-800 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 mb-2 sm:mb-3">PERSONAS</label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="w-full bg-transparent border-b border-zinc-800 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-brand-red transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => (
                          <option key={n} value={n} className="bg-black">{n} {n === 1 ? 'persona' : 'personas'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 mb-2 sm:mb-3">FECHA</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-brand-red transition-colors"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 sm:mt-8 md:mt-10 py-3.5 sm:py-4 md:py-5 bg-brand-red text-white text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] hover:bg-brand-red-light transition-colors disabled:opacity-50 font-barlow font-semibold"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? 'ENVIANDO...' : 'RESERVAR MESA'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer className="py-10 sm:py-12 md:py-16 px-4 sm:px-8 md:px-16 border-t border-brand-red/20">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 md:mb-16">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <img src={LOGO_URL} alt="Obsidian" className="h-8 sm:h-10 md:h-12 w-auto" />
                  <span className="text-lg sm:text-xl md:text-2xl tracking-wider" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>OBSIDIAN</span>
                </div>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  Donde la noche cobra vida. La experiencia premium de Monclova.
                </p>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-brand-red mb-2 sm:mb-4 font-barlow">UBICACIÓN</h4>
                <p className="text-zinc-400 text-xs sm:text-sm">Av. Principal #123</p>
                <p className="text-zinc-600 text-xs sm:text-sm">Centro, Monclova, Coahuila</p>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-brand-red mb-2 sm:mb-4 font-barlow">HORARIOS</h4>
                <p className="text-zinc-400 text-xs sm:text-sm">Viernes & Sábado</p>
                <p className="text-zinc-600 text-xs sm:text-sm">10:00 PM - 4:00 AM</p>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-brand-red mb-2 sm:mb-4 font-barlow">SIGUENOS</h4>
                <div className="flex gap-3 sm:gap-4">
                  {/* Instagram */}
                  <motion.a
                    href="https://www.instagram.com/obsidianmva/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-brand-red hover:text-brand-red transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </motion.a>
                  {/* Facebook */}
                  <motion.a
                    href="https://www.facebook.com/profile.php?id=61581587972708"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-zinc-900 gap-2 sm:gap-0">
              <p className="text-zinc-700 text-[10px] sm:text-xs">© 2026 OBSIDIAN SOCIAL CLUB</p>
              <p className="text-zinc-800 text-[10px] sm:text-xs">MONCLOVA, COAHUILA, MX</p>
            </div>
          </div>
        </footer>

        {/* Event Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEvent(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-zinc-950 border border-brand-red/30 rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Event Image */}
                {selectedEvent.image_url && (
                  <div className="relative h-48 sm:h-56">
                    <img
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors border border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  {/* Date badge */}
                  <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 px-3 py-1.5 rounded-full mb-4">
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-brand-gold text-sm font-barlow font-medium">
                      {formatEventDate(selectedEvent.event_date).day} {formatEventDate(selectedEvent.event_date).month}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                    {selectedEvent.title || selectedEvent.dj_name}
                  </h3>

                  {/* Subtitle */}
                  {selectedEvent.subtitle && (
                    <p className="font-script text-brand-gold text-xl mb-4">{selectedEvent.subtitle}</p>
                  )}

                  {/* DJ & Genre */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <p className="text-white/90 font-barlow">
                      <span className="text-brand-red">DJ:</span> {selectedEvent.dj_name}
                    </p>
                    {selectedEvent.genre && (
                      <p className="text-zinc-500 font-barlow uppercase tracking-wider">{selectedEvent.genre}</p>
                    )}
                  </div>

                  {/* Promotion */}
                  {selectedEvent.promotion && (
                    <div className="bg-brand-red/20 border border-brand-red/40 px-4 py-2 rounded-lg mb-6">
                      <p className="text-brand-red text-sm font-barlow font-medium">
                        🔥 {selectedEvent.promotion}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, date: selectedEvent.event_date }));
                        setSelectedEvent(null);
                        setChatbotOpen(true);
                      }}
                      className="flex-1 py-3 px-6 bg-brand-red text-white font-barlow font-semibold tracking-wider rounded-lg hover:bg-brand-red-light transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      RESERVAR PARA ESTE EVENTO
                    </motion.button>

                    {selectedEvent.spotify_url && (
                      <motion.a
                        href={selectedEvent.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-6 bg-green-600 text-white font-barlow font-semibold tracking-wider rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        SPOTIFY
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot */}
        <Chatbot isOpen={chatbotOpen} setIsOpen={setChatbotOpen} />
      </main>
    </>
  );
}
