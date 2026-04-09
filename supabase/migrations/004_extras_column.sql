-- Add extras column to properties for dynamic extracted data
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS extras jsonb DEFAULT NULL;

COMMENT ON COLUMN properties.extras IS 'Dynamic key-value data extracted from listing: floor, pets, furnished, amenities, etc.';
