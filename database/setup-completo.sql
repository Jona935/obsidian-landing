-- =============================================
-- OBSIDIAN SOCIAL CLUB - SETUP COMPLETO
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar extensión UUID
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

-- MENÚ
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('cocktails', 'shots', 'bottles', 'food', 'specials')),
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
  event_date DATE NOT NULL,
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

-- HERO IMAGES (4 imágenes del homepage)
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_images(order_index);

-- GALERÍA
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

-- CHAT LOGS
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('reservation', 'menu', 'dj_info', 'hours', 'location', 'dresscode', 'general', 'unknown')),
  helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_logs(session_id);

-- =============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (lectura)
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (available = true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read hero images" ON hero_images FOR SELECT USING (true);

-- Políticas de inserción (para API)
CREATE POLICY "Allow reservation insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow chat log insert" ON chat_logs FOR INSERT WITH CHECK (true);

-- Service role tiene acceso total (para admin)
CREATE POLICY "Service role full access reservations" ON reservations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access menu" ON menu_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access events" ON events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access gallery" ON gallery FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access chat" ON chat_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access hero" ON hero_images FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 3. VISTAS ÚTILES
-- =============================================

CREATE OR REPLACE VIEW upcoming_events AS
SELECT * FROM events
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;

CREATE OR REPLACE VIEW todays_reservations AS
SELECT * FROM reservations
WHERE date = CURRENT_DATE
ORDER BY time ASC;

CREATE OR REPLACE VIEW pending_reservations AS
SELECT * FROM reservations
WHERE status = 'pending'
ORDER BY date ASC, time ASC;

-- =============================================
-- 4. FUNCIONES
-- =============================================

CREATE OR REPLACE FUNCTION get_reservation_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_reservations BIGINT,
  confirmed_count BIGINT,
  pending_count BIGINT,
  cancelled_count BIGINT,
  total_guests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_reservations,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed_count,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_count,
    COALESCE(SUM(guests), 0)::BIGINT as total_guests
  FROM reservations
  WHERE date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. DATOS INICIALES (OPCIONAL - PERSONALIZAR)
-- =============================================

-- EVENTOS DE EJEMPLO
INSERT INTO events (title, subtitle, dj_name, event_date, event_time, genre, image_url, spotify_url, promotion, featured) VALUES
('NOCHE OBSCURA', 'El ritual comienza', 'DJ ALMEDA', CURRENT_DATE + INTERVAL '7 days', '22:00', 'Techno', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800', NULL, '2x1 en shots antes de las 11pm', true),
('HOUSE SESSIONS', 'Viernes de vibra', 'CARLOS MARÍN', CURRENT_DATE + INTERVAL '14 days', '22:00', 'Tech House', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', NULL, NULL, true),
('PROGRESSIVE NIGHTS', 'La noche no termina', 'DJ NOVA', CURRENT_DATE + INTERVAL '21 days', '22:00', 'Progressive House', 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800', NULL, 'Botella gratis en mesas VIP', false);

-- MENÚ - CÓCTELES
INSERT INTO menu_items (category, name, description, price, available, featured) VALUES
('cocktails', 'Obsidian Noir', 'Vodka premium, licor de mora, espuma de carbón activado', 180, true, true),
('cocktails', 'Midnight Martini', 'Gin Hendricks, vermouth seco, aceitunas negras', 160, true, false),
('cocktails', 'Shadow Kiss', 'Ron añejo, maracuyá fresco, albahaca, soda', 150, true, false),
('cocktails', 'Dark Negroni', 'Gin, Campari, vermouth rojo, naranja', 170, true, true),
('cocktails', 'Smoky Old Fashioned', 'Bourbon, jarabe de maple ahumado, angostura', 190, true, true),
('cocktails', 'Espresso Martini', 'Vodka, Kahlúa, espresso fresco', 160, true, false),
('cocktails', 'Mojito Obsidian', 'Ron blanco, hierbabuena, limón, mora', 140, true, false);

-- MENÚ - SHOTS
INSERT INTO menu_items (category, name, description, price, available, featured) VALUES
('shots', 'Black Diamond', 'Tequila blanco, licor de café, crema', 90, true, true),
('shots', 'Dark Matter', 'Mezcal joven, chamoy, tamarindo', 85, true, false),
('shots', 'Jägerbomb', 'Jägermeister con Red Bull', 95, true, false),
('shots', 'Kamikaze', 'Vodka, triple sec, jugo de limón', 80, true, false),
('shots', 'Tequila Premium', 'Don Julio Blanco', 100, true, false);

-- MENÚ - BOTELLAS
INSERT INTO menu_items (category, name, description, price, available, featured) VALUES
('bottles', 'Grey Goose', 'Vodka francés premium 750ml', 2500, true, false),
('bottles', 'Don Julio 70', 'Tequila añejo cristalino 750ml', 3200, true, false),
('bottles', 'Don Julio 1942', 'Tequila añejo premium 750ml', 6500, true, true),
('bottles', 'Moët & Chandon', 'Champagne Brut Imperial 750ml', 4500, true, true),
('bottles', 'Johnnie Walker Black', 'Whisky escocés 12 años 750ml', 2200, true, false),
('bottles', 'Buchanan''s 18', 'Whisky escocés 18 años 750ml', 3800, true, false);

-- MENÚ - COMIDA
INSERT INTO menu_items (category, name, description, price, available, featured) VALUES
('food', 'Tabla de Quesos', 'Selección de quesos premium con nueces', 350, true, false),
('food', 'Nachos Supreme', 'Totopos con queso, guacamole, pico de gallo', 220, true, false),
('food', 'Alitas BBQ', '12 piezas con salsa BBQ ahumada', 280, true, false),
('food', 'Guacamole Fresco', 'Preparado al momento con totopos', 180, true, false);

-- MENÚ - ESPECIALES
INSERT INTO menu_items (category, name, description, price, available, featured) VALUES
('specials', 'Torre de Shots', '10 shots variados para compartir', 750, true, false),
('specials', 'Bucket de Cervezas', '6 cervezas premium en hielo', 450, true, false),
('specials', 'Experiencia Obsidian', '2 botellas premium + mesa VIP + snacks', 8000, true, true);

-- HERO IMAGES (4 imágenes para el homepage)
INSERT INTO hero_images (image_url, order_index) VALUES
('https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400', 0),
('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 1),
('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', 2),
('https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', 3);

-- =============================================
-- 6. CREAR USUARIO ADMIN (para el panel)
-- =============================================
-- Ve a Authentication > Users en Supabase Dashboard
-- Crea un usuario con email y contraseña
-- Ese usuario podrá acceder a /login

-- =============================================
-- FIN DEL SETUP
-- =============================================
-- Después de ejecutar este SQL:
-- 1. Copia las API keys de Supabase (Settings > API)
-- 2. Actualiza el archivo .env.local con:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
-- 3. Crea un usuario en Authentication para el admin
-- 4. Obtén una API key de Groq (console.groq.com)
--    - GROQ_API_KEY
