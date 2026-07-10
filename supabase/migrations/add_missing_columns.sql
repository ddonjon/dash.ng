-- Add views column to properties table if it doesn't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add inquiries column to properties table if it doesn't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS inquiries INTEGER DEFAULT 0;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_views ON properties(views);
CREATE INDEX IF NOT EXISTS idx_properties_inquiries ON properties(inquiries);

-- Update existing properties to have default values
UPDATE properties SET views = 0 WHERE views IS NULL;
UPDATE properties SET inquiries = 0 WHERE inquiries IS NULL;
