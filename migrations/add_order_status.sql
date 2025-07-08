-- Add order_status column to requests table
ALTER TABLE requests 
ADD COLUMN order_status ENUM('pending', 'placed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending';

-- Update existing records where order was already placed
UPDATE requests 
SET order_status = 'placed' 
WHERE status = 'order placed' OR order_placed = true;
