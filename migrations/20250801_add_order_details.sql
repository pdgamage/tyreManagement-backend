-- Add orderNumber and orderNotes columns to requests table
ALTER TABLE requests 
ADD COLUMN orderNumber VARCHAR(100),
ADD COLUMN orderNotes TEXT;
