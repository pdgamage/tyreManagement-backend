-- Add new fields to requests table
ALTER TABLE requests 
ADD COLUMN deliveryOfficeName VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN deliveryStreetName VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN deliveryTown VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN warrantyDistance INT NOT NULL DEFAULT 0,
ADD COLUMN tireWearIndicatorAppeared ENUM('yes', 'no') NOT NULL DEFAULT 'no';
