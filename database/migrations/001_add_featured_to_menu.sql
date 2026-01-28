-- Migration: Add featured column to menu_items table
-- Run this if you already have the menu_items table and need to add the featured column

-- Add the featured column
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for featured queries
CREATE INDEX IF NOT EXISTS idx_menu_featured ON menu_items(featured);

-- Optional: Mark some items as featured for testing
-- UPDATE menu_items SET featured = true WHERE name IN ('Obsidian Noir', 'Grey Goose', 'Don Julio 1942');
