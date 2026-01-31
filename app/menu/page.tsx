'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/menu?available=true').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([menuData, categoriesData]) => {
        const items = menuData.items || [];
        const cats = categoriesData.categories || [];

        setMenuItems(items);
        setCategories(cats);

        // Set first category with items as active
        const catsWithItems = cats.filter((cat: Category) =>
          items.some((item: MenuItem) => item.category === cat.id)
        );
        if (catsWithItems.length > 0) {
          setActiveCategory(catsWithItems[0].id);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getItemsByCategory = (category: string) =>
    menuItems.filter(item => item.category === category);

  // Filter categories that have items
  const categoriesWithItems = categories.filter(cat =>
    menuItems.some(item => item.category === cat.id)
  );

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Menu - Obsidian Social Club</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              font-family: 'Inter', sans-serif;
              background: #000;
              color: #fff;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              margin-bottom: 50px;
              padding-bottom: 30px;
              border-bottom: 1px solid #333;
            }

            .logo {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              letter-spacing: 0.2em;
              margin-bottom: 10px;
            }

            .subtitle {
              font-size: 12px;
              letter-spacing: 0.4em;
              color: #888;
            }

            .category {
              margin-bottom: 40px;
            }

            .category-title {
              font-size: 14px;
              letter-spacing: 0.3em;
              color: #C41E3A;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #222;
            }

            .item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px dotted #222;
            }

            .item:last-child {
              border-bottom: none;
            }

            .item-info {
              flex: 1;
            }

            .item-name {
              font-weight: 500;
              margin-bottom: 4px;
            }

            .item-description {
              font-size: 12px;
              color: #888;
            }

            .item-price {
              font-weight: 500;
              margin-left: 20px;
              color: #D4AF37;
            }

            .footer {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px solid #333;
              text-align: center;
              font-size: 11px;
              color: #666;
            }

            @media print {
              body { background: #fff; color: #000; }
              .category-title { color: #C41E3A; border-color: #ccc; }
              .item { border-color: #ddd; }
              .item-description { color: #666; }
              .item-price { color: #8B6914; }
              .footer { color: #999; border-color: #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">OBSIDIAN</div>
            <div class="subtitle">SOCIAL CLUB</div>
          </div>

          ${categoriesWithItems.map(cat => {
            const items = menuItems.filter(item => item.category === cat.id);
            if (items.length === 0) return '';
            return `
              <div class="category">
                <div class="category-title">${cat.name.toUpperCase()}</div>
                ${items.map(item => `
                  <div class="item">
                    <div class="item-info">
                      <div class="item-name">${item.name}</div>
                      ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    </div>
                    <div class="item-price">$${item.price}</div>
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}

          <div class="footer">
            <p>OBSIDIAN SOCIAL CLUB</p>
            <p>Monclova, Coahuila</p>
            <p>Jueves a Sabado - 10:00 PM - 2:00 AM</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl tracking-[0.2em] text-white hover:text-zinc-300 transition-colors" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            OBSIDIAN
          </Link>
          <motion.button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-[0.1em] border border-zinc-700 text-white hover:border-brand-red hover:bg-brand-red hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DESCARGAR PDF
          </motion.button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand-red text-xs tracking-[0.3em] block mb-4 font-barlow">NUESTRA CARTA</span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display mb-6">MENU</h1>
          <p className="text-zinc-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-barlow">
            Bebidas, cocteles y cervezas premium para tu noche perfecta.
          </p>
        </motion.div>
      </section>

      {/* Category Navigation */}
      <nav className="sticky top-16 z-30 bg-black/90 backdrop-blur-md border-y border-zinc-900 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex gap-1 sm:gap-2 py-2 min-w-max sm:justify-center">
            {categoriesWithItems.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] transition-all whitespace-nowrap font-barlow ${
                  activeCategory === cat.id
                    ? 'bg-brand-red text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu Content */}
      <section ref={menuRef} className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="flex justify-center gap-1 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-brand-red rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-barlow">Cargando menu...</p>
            </div>
          ) : (
            categoriesWithItems.map((cat) => {
              const items = getItemsByCategory(cat.id);
              if (items.length === 0) return null;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeCategory === cat.id ? 1 : 0,
                    display: activeCategory === cat.id ? 'block' : 'none'
                  }}
                  className="mb-16"
                >
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-brand-red/30">
                    <h2 className="text-sm sm:text-base tracking-[0.2em] text-brand-gold font-barlow font-semibold">{cat.name.toUpperCase()}</h2>
                    <span className="text-zinc-600 text-xs font-barlow">({items.length} items)</span>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group flex justify-between items-start py-3 border-b border-zinc-900 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-brand-gold transition-colors mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-barlow">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg sm:text-xl font-semibold text-brand-gold">
                            ${item.price}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Empty state */}
          {!loading && menuItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 font-barlow">No hay items disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-8 border-t border-zinc-900">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-zinc-500 text-sm mb-6 font-barlow">
            Lleva nuestro menu contigo
          </p>
          <motion.button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white text-xs tracking-[0.2em] hover:bg-brand-red-light transition-colors font-barlow font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DESCARGAR MENU EN PDF
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 md:px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl tracking-[0.2em] text-zinc-500 hover:text-white transition-colors" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            OBSIDIAN
          </Link>
          <p className="text-zinc-700 text-xs font-barlow">2026 OBSIDIAN SOCIAL CLUB</p>
        </div>
      </footer>
    </main>
  );
}
