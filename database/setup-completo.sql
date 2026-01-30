-- =============================================
-- OBSIDIAN SOCIAL CLUB - SETUP COMPLETO
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLAS
-- =============================================

-- RESERVACIONES
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  guests INT DEFAULT 2,
  table_type TEXT DEFAULT 'general' CHECK (table_type IN ('general', 'vip', 'booth')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- CATEGORIAS DE MENU
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON menu_categories(display_order);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_featured ON menu_items(featured);

-- EVENTOS / DJs
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  dj_name TEXT NOT NULL,
  event_date DATE NOT NULL CHECK (event_date >= CURRENT_DATE),
  event_time TEXT,
  genre TEXT,
  description TEXT,
  image_url TEXT,
  spotify_url TEXT,
  instagram_url TEXT,
  promotion TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

-- HERO IMAGES (4 imagenes del homepage)
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_images(order_index);

-- GALERIA
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  event_date DATE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(featured);

-- =============================================
-- 2. DATOS INICIALES - CATEGORIAS DEL MENU
-- =============================================

INSERT INTO menu_categories (id, name, display_order) VALUES
  ('bebidas', 'Bebidas', 1),
  ('cervezas-nacionales', 'Cervezas Nacionales', 2),
  ('cervezas-premium', 'Cervezas Premium', 3),
  ('cervezas-importadas', 'Cervezas Importadas', 4),
  ('limonadas', 'Limonadas', 5),
  ('vodka-drinks', 'Vodka Drinks', 6),
  ('ron-drinks', 'Ron Drinks', 7),
  ('clasicos', 'Los Clasicos', 8),
  ('tequila-drinks', 'Tequila Drinks', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order;

-- =============================================
-- 3. DATOS INICIALES - PRODUCTOS DEL MENU
-- =============================================

-- BEBIDAS (Refrescos / Aguas)
INSERT INTO menu_items (category, name, price, available) VALUES
  ('bebidas', 'Refresco', 33, true),
  ('bebidas', 'Agua mineral', 34, true),
  ('bebidas', 'Agua natural', 39, true),
  ('bebidas', 'Agua mineral saborizada', 43, true),
  ('bebidas', 'Agua de fresa', 30, true),
  ('bebidas', 'Agua de mango', 30, true);

-- CERVEZAS NACIONALES
INSERT INTO menu_items (category, name, price, available) VALUES
  ('cervezas-nacionales', 'Tecate Light', 30, true),
  ('cervezas-nacionales', 'Tecate Roja', 37, true),
  ('cervezas-nacionales', 'Indio', 33, true),
  ('cervezas-nacionales', 'XX Lager', 33, true),
  ('cervezas-nacionales', 'Carta Blanca', 37, true);

-- CERVEZAS PREMIUM
INSERT INTO menu_items (category, name, price, available) VALUES
  ('cervezas-premium', 'Bohemia Oscura', 46, true),
  ('cervezas-premium', 'Bohemia Clara', 46, true),
  ('cervezas-premium', 'Ultra', 39, true),
  ('cervezas-premium', 'XX Ambar', 39, true);

-- CERVEZAS IMPORTADAS / ESPECIALES
INSERT INTO menu_items (category, name, price, available) VALUES
  ('cervezas-importadas', 'Ultra Gold', 79, true),
  ('cervezas-importadas', 'Corona Premier Gold', 79, true),
  ('cervezas-importadas', 'Modelitos', 72, true);

-- LIMONADAS
INSERT INTO menu_items (category, name, price, available) VALUES
  ('limonadas', 'Limonada natural', 79, true),
  ('limonadas', 'Limonada de fresa', 72, true),
  ('limonadas', 'Limonada de mango', 72, true);

-- VODKA DRINKS
INSERT INTO menu_items (category, name, price, available) VALUES
  ('vodka-drinks', 'Vodka Sky', 76, true),
  ('vodka-drinks', 'Azulito', 76, true),
  ('vodka-drinks', 'Peach Punch', 76, true);

-- RON DRINKS
INSERT INTO menu_items (category, name, price, available) VALUES
  ('ron-drinks', 'Cielo Rojo', 79, true),
  ('ron-drinks', 'Pina Colada', 79, true),
  ('ron-drinks', 'Barbados Surprise', 79, true),
  ('ron-drinks', 'White Kiss', 79, true),
  ('ron-drinks', 'Mojitos (limon, fresa, mango)', 79, true);

-- LOS CLASICOS (Los que no faltan para tu noche)
INSERT INTO menu_items (category, name, price, available) VALUES
  ('clasicos', 'Gin Tonic', 79, true),
  ('clasicos', 'Clericot', 79, true),
  ('clasicos', 'Clericot Ponche Frio', 79, true),
  ('clasicos', 'Mezcalinas (jamaica, naranja, tamarindo)', 76, true),
  ('clasicos', 'Carajillo', 76, true);

-- TEQUILA DRINKS
INSERT INTO menu_items (category, name, price, available) VALUES
  ('tequila-drinks', 'Tequila natural', 68, true),
  ('tequila-drinks', 'Paloma', 68, true);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Politicas de lectura publica (SELECT)
CREATE POLICY "Lectura publica de reservaciones" ON reservations FOR SELECT USING (true);
CREATE POLICY "Lectura publica de categorias" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Lectura publica de menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Lectura publica de eventos" ON events FOR SELECT USING (true);
CREATE POLICY "Lectura publica de hero images" ON hero_images FOR SELECT USING (true);
CREATE POLICY "Lectura publica de galeria" ON gallery FOR SELECT USING (true);

-- Politicas de insercion publica (para reservaciones desde el chatbot)
CREATE POLICY "Insercion publica de reservaciones" ON reservations FOR INSERT WITH CHECK (true);

-- Politicas de escritura con service_role (para el admin)
CREATE POLICY "Admin escribe reservaciones" ON reservations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin escribe categorias" ON menu_categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin escribe menu" ON menu_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin escribe eventos" ON events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin escribe hero images" ON hero_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin escribe galeria" ON gallery FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 5. STORAGE BUCKETS (ejecutar por separado si es necesario)
-- =============================================

-- Crear bucket para imagenes (ejecutar en Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('imgs', 'imgs', true);

-- =============================================
-- FIN DEL SETUP
-- =============================================
