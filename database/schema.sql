-- =============================================
-- OBSIDIAN SOCIAL CLUB - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- RESERVATIONS TABLE
-- =============================================
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);

-- =============================================
-- MENU ITEMS TABLE
-- =============================================
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

-- Index for menu queries
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_featured ON menu_items(featured);

-- =============================================
-- EVENTS / DJS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dj_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  genre TEXT,
  description TEXT,
  image_url TEXT,
  spotify_url TEXT,
  instagram_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

-- =============================================
-- HERO IMAGES TABLE (max 4 images for homepage)
-- =============================================
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for hero images
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_images(order_index);

-- RLS for hero_images
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hero images" ON hero_images FOR SELECT USING (true);
CREATE POLICY "Service role full access hero" ON hero_images FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- GALLERY TABLE
-- =============================================
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

-- Index for gallery queries
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(featured);
CREATE INDEX IF NOT EXISTS idx_gallery_event ON gallery(event_id);

-- =============================================
-- CHAT LOGS TABLE (for improving the chatbot)
-- =============================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('reservation', 'menu', 'dj_info', 'hours', 'location', 'dresscode', 'general', 'unknown')),
  helpful BOOLEAN, -- User feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chat analysis
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_intent ON chat_logs(intent);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for menu, events, gallery
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (available = true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);

-- Allow insert for reservations and chat_logs (from API)
CREATE POLICY "Allow reservation insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow chat log insert" ON chat_logs FOR INSERT WITH CHECK (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access reservations" ON reservations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access menu" ON menu_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access events" ON events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access gallery" ON gallery FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access chat" ON chat_logs FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Sample menu items
INSERT INTO menu_items (category, name, description, price, available) VALUES
  ('cocktails', 'Obsidian Noir', 'Vodka, licor de mora, espuma de carbón activado', 180.00, true),
  ('cocktails', 'Midnight Martini', 'Gin premium, vermouth seco, aceitunas negras', 160.00, true),
  ('cocktails', 'Shadow Kiss', 'Ron añejo, maracuyá fresca, albahaca', 150.00, true),
  ('cocktails', 'Old Fashioned', 'Bourbon, angostura, twist de naranja', 150.00, true),
  ('cocktails', 'Dark Negroni', 'Gin, Campari, vermouth rojo, carbón', 170.00, true),
  ('shots', 'Black Diamond', 'Tequila reposado, licor de café, crema irlandesa', 90.00, true),
  ('shots', 'Dark Matter', 'Mezcal joven, chamoy, tamarindo', 85.00, true),
  ('shots', 'Obsidian Shot', 'Vodka negro, limón, sal negra', 80.00, true),
  ('bottles', 'Grey Goose', 'Vodka Premium 750ml', 2500.00, true),
  ('bottles', 'Don Julio 70', 'Tequila Añejo Cristalino 750ml', 3200.00, true),
  ('bottles', 'Moët & Chandon', 'Champagne Brut Imperial 750ml', 4500.00, true),
  ('bottles', 'Johnnie Walker Black', 'Whisky Escocés 750ml', 2200.00, true),
  ('bottles', 'Buchanan''s 18', 'Whisky Escocés Premium 750ml', 3800.00, true);

-- Sample events
INSERT INTO events (dj_name, event_date, event_time, genre, featured, description) VALUES
  ('DJ SHADOW', CURRENT_DATE + INTERVAL '7 days', '11:00 PM', 'Tech House', true, 'Una noche de beats oscuros y ritmos hipnóticos'),
  ('NINA KRAVIZ', CURRENT_DATE + INTERVAL '14 days', '11:00 PM', 'Techno', true, 'La reina del techno llega a Obsidian'),
  ('FISHER', CURRENT_DATE + INTERVAL '21 days', '11:00 PM', 'House', true, 'Losing It - La fiesta del año'),
  ('LOCAL HEROES', CURRENT_DATE + INTERVAL '28 days', '10:00 PM', 'Mixed', false, 'Lo mejor del talento local');

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- Upcoming events view
CREATE OR REPLACE VIEW upcoming_events AS
SELECT * FROM events
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;

-- Today's reservations view
CREATE OR REPLACE VIEW todays_reservations AS
SELECT * FROM reservations
WHERE date = CURRENT_DATE
ORDER BY time ASC;

-- Pending reservations view
CREATE OR REPLACE VIEW pending_reservations AS
SELECT * FROM reservations
WHERE status = 'pending'
ORDER BY date ASC, time ASC;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get reservation stats
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
