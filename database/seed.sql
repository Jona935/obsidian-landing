-- =============================================
-- DATOS DE PRUEBA - OBSIDIAN SOCIAL CLUB
-- =============================================

-- Limpiar datos existentes (opcional)
-- TRUNCATE TABLE reservations, events, menu_items RESTART IDENTITY CASCADE;

-- =============================================
-- EVENTOS / DJs
-- =============================================
INSERT INTO events (dj_name, event_date, event_time, genre, image_url, spotify_url, featured) VALUES
('DJ ALMEDA', '2026-01-31', '22:00', 'Techno', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800', 'https://open.spotify.com/artist/19HM5j0ULGSmEoRcrSe5x3', true),
('CARLOS MARÍN', '2026-02-01', '22:00', 'Tech House', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb', true),
('DJ NOVA', '2026-02-07', '22:00', 'Progressive House', 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800', 'https://open.spotify.com/artist/1HY2Jd0NmPuamShAr6KMms', false),
('ELECTRONIKA', '2026-02-08', '22:00', 'EDM', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2', true),
('DJ SHADOW MX', '2026-02-14', '22:00', 'Deep House', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', 'https://open.spotify.com/artist/5he5w2lnU9x7JFhnwcekXX', false),
('VALENTINA ROSE', '2026-02-14', '23:00', 'Melodic Techno', 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=800', 'https://open.spotify.com/artist/0k17h0D3J5VfsdmQ1iZtE9', true),
('BASS BROTHERS', '2026-02-21', '22:00', 'Bass House', 'https://images.unsplash.com/photo-1571935441260-e4d94a237c9d?w=800', NULL, false),
('DJ XTREME', '2026-02-22', '22:00', 'Reggaeton/Electro', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5', false),
('MINIMAL COLLECTIVE', '2026-02-28', '22:00', 'Minimal Techno', NULL, 'https://open.spotify.com/artist/4LLpKhyESsyAXpc4laK94U', false),
('DJ NEON', '2026-03-01', '22:00', 'Future House', 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800', NULL, false);

-- =============================================
-- MENÚ - CÓCTELES
-- =============================================
INSERT INTO menu_items (category, name, description, price, available) VALUES
('cocktails', 'Obsidian Noir', 'Vodka premium, licor de mora, jugo de limón, espuma de carbón activado', 180, true),
('cocktails', 'Midnight Martini', 'Gin Hendricks, vermouth seco, aceitunas negras, twist de limón', 160, true),
('cocktails', 'Shadow Kiss', 'Ron añejo, maracuyá fresco, albahaca, soda de jengibre', 150, true),
('cocktails', 'Dark Negroni', 'Gin, Campari, vermouth rojo, naranja deshidratada', 170, true),
('cocktails', 'Velvet Night', 'Tequila reposado, licor de café, crema irlandesa, espresso', 165, true),
('cocktails', 'Electric Blue', 'Vodka, curaçao azul, jugo de limón, Red Bull', 155, true),
('cocktails', 'Smoky Old Fashioned', 'Bourbon, jarabe de maple ahumado, angostura, naranja', 190, true),
('cocktails', 'Tropical Noir', 'Ron blanco, piña, coco, jugo de limón, carbón activado', 145, true),
('cocktails', 'Espresso Martini', 'Vodka, Kahlúa, espresso fresco, jarabe simple', 160, true),
('cocktails', 'Mojito Obsidian', 'Ron blanco, hierbabuena, limón, soda, toque de mora', 140, true);

-- =============================================
-- MENÚ - SHOTS
-- =============================================
INSERT INTO menu_items (category, name, description, price, available) VALUES
('shots', 'Black Diamond', 'Tequila blanco, licor de café, toque de crema', 90, true),
('shots', 'Dark Matter', 'Mezcal joven, chamoy, tamarindo, sal de gusano', 85, true),
('shots', 'Jägerbomb', 'Jägermeister con Red Bull', 95, true),
('shots', 'Kamikaze', 'Vodka, triple sec, jugo de limón', 80, true),
('shots', 'Tequila Premium', 'Don Julio Blanco', 100, true),
('shots', 'B-52', 'Kahlúa, Baileys, Grand Marnier en capas', 95, true),
('shots', 'Fireball', 'Whisky de canela', 75, true),
('shots', 'Lemon Drop', 'Vodka cítrico, limón, azúcar', 80, true);

-- =============================================
-- MENÚ - BOTELLAS
-- =============================================
INSERT INTO menu_items (category, name, description, price, available) VALUES
('bottles', 'Grey Goose', 'Vodka francés premium 750ml', 2500, true),
('bottles', 'Belvedere', 'Vodka polaco premium 750ml', 2800, true),
('bottles', 'Don Julio 70', 'Tequila añejo cristalino 750ml', 3200, true),
('bottles', 'Don Julio 1942', 'Tequila añejo premium 750ml', 6500, true),
('bottles', 'Clase Azul Reposado', 'Tequila ultra premium 750ml', 8500, true),
('bottles', 'Moët & Chandon', 'Champagne Brut Imperial 750ml', 4500, true),
('bottles', 'Veuve Clicquot', 'Champagne Yellow Label 750ml', 5200, true),
('bottles', 'Dom Pérignon', 'Champagne vintage 750ml', 12000, true),
('bottles', 'Johnnie Walker Black', 'Whisky escocés 12 años 750ml', 2200, true),
('bottles', 'Buchanan''s 18', 'Whisky escocés 18 años 750ml', 3800, true),
('bottles', 'Hennessy VS', 'Cognac francés 750ml', 2800, true),
('bottles', 'Bombay Sapphire', 'Gin inglés premium 750ml', 1800, true);

-- =============================================
-- MENÚ - COMIDA
-- =============================================
INSERT INTO menu_items (category, name, description, price, available) VALUES
('food', 'Tabla de Quesos', 'Selección de quesos premium con nueces y mermelada', 350, true),
('food', 'Nachos Supreme', 'Totopos con queso, guacamole, pico de gallo, jalapeños', 220, true),
('food', 'Alitas BBQ', '12 piezas de alitas con salsa BBQ ahumada', 280, true),
('food', 'Sliders Premium', '4 mini hamburguesas de res Angus con queso', 320, true),
('food', 'Tabla de Carnes Frías', 'Jamón serrano, salami, chorizo español', 420, true),
('food', 'Guacamole Fresco', 'Preparado al momento con totopos', 180, true),
('food', 'Papas Gourmet', 'Papas fritas con trufa y parmesano', 200, true),
('food', 'Ceviche de Camarón', 'Camarón fresco con aguacate y tostadas', 290, true);

-- =============================================
-- MENÚ - ESPECIALES
-- =============================================
INSERT INTO menu_items (category, name, description, price, available) VALUES
('specials', 'Torre de Shots', '10 shots variados para compartir', 750, true),
('specials', 'Bucket de Cervezas', '6 cervezas premium en hielo', 450, true),
('specials', 'Combo VIP', 'Botella Grey Goose + 10 Red Bull + snacks', 3500, true),
('specials', 'Paquete Cumpleañero', 'Botella Don Julio 70 + sparklers + postre', 4200, true),
('specials', 'Experiencia Obsidian', '2 botellas premium + mesa VIP + snacks premium', 8000, true);

-- =============================================
-- RESERVACIONES DE PRUEBA
-- =============================================
INSERT INTO reservations (name, email, phone, date, time, guests, table_type, notes, status) VALUES
('María García López', 'maria.garcia@email.com', '8661234567', '2026-01-31', '22:00', 4, 'vip', 'Cumpleaños de mi amiga', 'confirmed'),
('Roberto Hernández', 'roberto.hdz@email.com', '8669876543', '2026-01-31', '23:00', 6, 'booth', 'Despedida de soltero', 'confirmed'),
('Ana Martínez', 'ana.mtz@email.com', '8665551234', '2026-02-01', '22:00', 2, 'general', NULL, 'pending'),
('Carlos Rodríguez', 'carlos.rod@email.com', '8664443333', '2026-02-01', '22:30', 8, 'vip', 'Celebración de ascenso', 'pending'),
('Laura Sánchez', 'laura.s@email.com', '8667778888', '2026-02-07', '22:00', 3, 'general', NULL, 'pending'),
('Miguel Ángel Torres', 'miguel.torres@email.com', '8662223333', '2026-02-07', '23:00', 10, 'booth', 'Reunión de empresa', 'confirmed'),
('Sofía Ramírez', 'sofia.ramirez@email.com', '8669991111', '2026-02-08', '22:00', 4, 'vip', NULL, 'pending'),
('Diego Morales', 'diego.m@email.com', '8663334444', '2026-02-14', '21:00', 2, 'vip', 'Cena romántica San Valentín', 'confirmed'),
('Patricia Ruiz', 'paty.ruiz@email.com', '8665556666', '2026-02-14', '22:00', 4, 'general', 'Aniversario', 'pending'),
('Fernando López', 'fer.lopez@email.com', '8668887777', '2026-02-21', '22:00', 6, 'vip', NULL, 'cancelled'),
('Alejandra Díaz', 'ale.diaz@email.com', '8661112222', '2026-02-22', '23:00', 5, 'general', NULL, 'pending'),
('Juan Pablo Núñez', 'jp.nunez@email.com', '8664445555', '2026-02-28', '22:00', 8, 'booth', 'Cumpleaños 30', 'confirmed');

-- =============================================
-- VERIFICAR DATOS INSERTADOS
-- =============================================
-- SELECT 'Eventos:' as tabla, COUNT(*) as total FROM events
-- UNION ALL
-- SELECT 'Items del Menú:', COUNT(*) FROM menu_items
-- UNION ALL
-- SELECT 'Reservaciones:', COUNT(*) FROM reservations;
