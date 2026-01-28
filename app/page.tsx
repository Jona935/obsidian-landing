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
  featured: boolean;
}

// Loading Screen - Fully Responsive and Centered
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-4 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center w-full max-w-lg flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          {/* Compensate letter-spacing with negative margin-right equal to tracking */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-white mr-[0.15em] sm:mr-[0.2em] md:mr-[0.3em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            OBSIDIAN
          </motion.h1>
          <motion.div
            className="h-[1px] bg-white mt-4 w-48 sm:w-56 md:w-64 lg:w-72"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.p
            className="text-zinc-500 tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] text-xs sm:text-sm mt-4 mr-[0.3em] sm:mr-[0.4em] md:mr-[0.5em]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            SOCIAL CLUB
          </motion.p>
        </motion.div>
        <motion.div
          className="flex justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated Section Wrapper
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  return (
    <motion.section
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
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Bienvenido a Obsidian Social Club! Soy tu asistente virtual. Puedo ayudarte con:\n\n• Reservaciones de mesa\n• Información de próximos DJs\n• Nuestro menú de bebidas\n• Horarios y ubicación\n\n¿En qué puedo ayudarte?' }
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
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-white text-black rounded-br-sm'
                      : 'bg-zinc-900 text-zinc-300 rounded-bl-sm'
                  }`}>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
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
    name: '', email: '', phone: '', date: '', time: '22:00', guests: 2, tableType: 'general', notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [heroMousePosition, setHeroMousePosition] = useState({ x: 0, y: 0 });

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
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', date: '', time: '22:00', guests: 2, tableType: 'general', notes: '' });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
          className="fixed top-0 left-0 right-0 z-40 mix-blend-difference"
        >
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6 flex items-center justify-between">
            <motion.a
              href="#"
              className="text-white text-xl font-serif tracking-[0.2em]"
              whileHover={{ scale: 1.05 }}
            >
              OBSIDIAN
            </motion.a>
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
          </div>
        </motion.nav>

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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif leading-none tracking-[0.05em] sm:tracking-[0.08em] md:tracking-[0.1em] mb-2 sm:mb-4">
                OBSIDIAN
              </h1>
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <span className="w-8 sm:w-12 md:w-16 h-[1px] bg-white/50" />
                <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] text-zinc-400">SOCIAL CLUB</span>
                <span className="w-8 sm:w-12 md:w-16 h-[1px] bg-white/50" />
              </div>

              {/* Floating Images below title */}
              <FloatingImages mousePosition={heroMousePosition} />

              <p className="text-zinc-500 text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] mt-8 sm:mt-10 md:mt-12 max-w-lg mx-auto px-4">
                DONDE LA NOCHE COBRA VIDA
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-zinc-600">SCROLL</span>
              <div className="w-[1px] h-8 sm:h-10 md:h-12 bg-gradient-to-b from-zinc-600 to-transparent" />
            </motion.div>
          </motion.div>
        </section>

        {/* Events Section */}
        <AnimatedSection className="py-32 px-8 md:px-16 bg-black" id="eventos">
          <div className="max-w-[1800px] mx-auto">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div>
                <span className="text-zinc-600 text-xs tracking-[0.3em] block mb-4">PRÓXIMOS EVENTOS</span>
                <h2 className="text-5xl md:text-7xl font-serif">LINE UP</h2>
              </div>
              <p className="text-zinc-500 text-sm max-w-md mt-6 md:mt-0 leading-relaxed">
                Los mejores artistas de la escena electrónica internacional en un solo lugar.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
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
                        {/* Date - with mix-blend for contrast on any image */}
                        <div className="self-end text-right mix-blend-difference">
                          <span className="block text-3xl sm:text-4xl font-serif text-white">{date.day}</span>
                          <span className="text-[10px] sm:text-xs tracking-[0.2em] text-white">{date.month}</span>
                        </div>

                        {/* Info */}
                        <div>
                          <motion.h3
                            className="text-xl sm:text-2xl md:text-3xl font-medium mb-1 sm:mb-2"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                          >
                            {event.dj_name}
                          </motion.h3>
                          <p className="text-zinc-500 text-xs sm:text-sm tracking-wider">{event.genre}</p>

                          {event.spotify_url && (
                            <motion.a
                              href={event.spotify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-2 sm:mt-3 text-emerald-400 text-[10px] sm:text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              whileHover={{ x: 5 }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                              ESCUCHAR
                            </motion.a>
                          )}
                        </div>
                      </div>

                      {/* Border Animation */}
                      <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500" />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-20 text-zinc-600">
                  <p className="text-lg">Próximamente anunciaremos nuevos eventos</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Marquee Divider */}
        <div className="py-8 border-y border-zinc-900 overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap"
          >
            {Array(10).fill(null).map((_, i) => (
              <span key={i} className="text-zinc-800 text-sm tracking-[0.5em]">
                TECHNO • HOUSE • ELECTRONIC • UNDERGROUND • OBSIDIAN •
              </span>
            ))}
          </motion.div>
        </div>

        {/* Menu Section */}
        <AnimatedSection className="py-32 px-8 md:px-16 bg-zinc-950" id="menu">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left - Title & Description */}
              <div className="sticky top-32">
                <span className="text-zinc-600 text-xs tracking-[0.3em] block mb-4">NUESTRA CARTA</span>
                <h2 className="text-5xl md:text-7xl font-serif mb-8">MENÚ</h2>
                <p className="text-zinc-500 leading-relaxed mb-8 max-w-md">
                  Descubre nuestra selección de cócteles signature, shots especiales y botellas premium.
                  Cada bebida está cuidadosamente elaborada para complementar tu experiencia.
                </p>
                <a
                  href="/menu"
                  className="inline-flex items-center gap-3 text-white text-xs tracking-[0.2em] group hover:text-zinc-300 transition-colors"
                >
                  VER MENÚ COMPLETO
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>

              {/* Right - Menu Items */}
              <div className="space-y-12">
                {/* Featured Items */}
                <div>
                  <h3 className="text-xs tracking-[0.3em] text-zinc-600 mb-6 pb-2 border-b border-zinc-800 flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span> DESTACADOS
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
                            {item.featured && <span className="text-yellow-500 text-sm">⭐</span>}
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
        <AnimatedSection className="py-32 px-8 md:px-16 bg-black" id="reservar">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <span className="text-zinc-600 text-xs tracking-[0.3em] block mb-4">ASEGURA TU LUGAR</span>
              <h2 className="text-5xl md:text-7xl font-serif">RESERVAR</h2>
            </div>

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 border border-zinc-800"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-serif mb-4">Reservación Enviada</h3>
                  <p className="text-zinc-500 mb-8">Te contactaremos para confirmar.</p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                  >
                    NUEVA RESERVACIÓN
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleReservation}
                  className="border border-zinc-800 p-8 md:p-12"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">NOMBRE</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">EMAIL</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">TELÉFONO</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">PERSONAS</label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      >
                        {[2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => (
                          <option key={n} value={n} className="bg-black">{n} personas</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">FECHA</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-3">HORA</label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      >
                        <option value="21:00" className="bg-black">9:00 PM</option>
                        <option value="22:00" className="bg-black">10:00 PM</option>
                        <option value="23:00" className="bg-black">11:00 PM</option>
                        <option value="00:00" className="bg-black">12:00 AM</option>
                      </select>
                    </div>
                  </div>

                  {/* Table Type */}
                  <div className="mt-12">
                    <label className="block text-xs tracking-[0.2em] text-zinc-500 mb-6">TIPO DE MESA</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'general', name: 'GENERAL', price: 'Sin mínimo' },
                        { id: 'vip', name: 'VIP', price: 'Mín. $3,000' },
                        { id: 'booth', name: 'BOOTH', price: 'Mín. $8,000' },
                      ].map((table) => (
                        <motion.button
                          key={table.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, tableType: table.id })}
                          className={`p-6 border text-center transition-all ${
                            formData.tableType === table.id
                              ? 'border-white bg-white/5'
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <p className="text-xs tracking-[0.2em] mb-2">{table.name}</p>
                          <p className="text-zinc-500 text-xs">{table.price}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-12 py-5 bg-white text-black text-xs tracking-[0.2em] hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR RESERVACIÓN'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer className="py-16 px-8 md:px-16 border-t border-zinc-900">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div>
                <h3 className="font-serif text-2xl mb-6">OBSIDIAN</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Donde la noche cobra vida. La experiencia premium de Monclova.
                </p>
              </div>
              <div>
                <h4 className="text-xs tracking-[0.2em] text-zinc-500 mb-4">UBICACIÓN</h4>
                <p className="text-zinc-400 text-sm">Av. Principal #123</p>
                <p className="text-zinc-600 text-sm">Centro, Monclova, Coahuila</p>
              </div>
              <div>
                <h4 className="text-xs tracking-[0.2em] text-zinc-500 mb-4">HORARIOS</h4>
                <p className="text-zinc-400 text-sm">Viernes & Sábado</p>
                <p className="text-zinc-600 text-sm">10:00 PM - 4:00 AM</p>
              </div>
              <div>
                <h4 className="text-xs tracking-[0.2em] text-zinc-500 mb-4">SÍGUENOS</h4>
                <div className="flex gap-4">
                  {['IG', 'TW', 'SP'].map((social) => (
                    <motion.a
                      key={social}
                      href="#"
                      className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xs text-zinc-500 hover:border-white hover:text-white transition-colors"
                      whileHover={{ y: -2 }}
                    >
                      {social}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-900">
              <p className="text-zinc-700 text-xs">© 2026 OBSIDIAN SOCIAL CLUB</p>
              <p className="text-zinc-800 text-xs mt-4 md:mt-0">MONCLOVA, COAHUILA, MX</p>
            </div>
          </div>
        </footer>

        {/* Chatbot */}
        <Chatbot />
      </main>
    </>
  );
}
