-- Add orderPlacedDate column to requests table
ALTER TABLE requests
ADD COLUMN orderPlacedDate TIMESTAMP;

-- Update existing records to have a default value (optional)
UPDATE requests 
SET orderPlacedDate = submittedAt 
WHERE orderPlacedDate IS NULL AND orderNumber IS NOT NULL;
