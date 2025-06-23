ALTER TABLE requests
ADD COLUMN supervisor_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN supervisor_notes TEXT,
ADD COLUMN supervisor_timestamp DATETIME,
ADD COLUMN technical_manager_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN technical_manager_notes TEXT,
ADD COLUMN technical_manager_timestamp DATETIME,
ADD COLUMN engineer_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN engineer_notes TEXT,
ADD COLUMN engineer_timestamp DATETIME,
ADD COLUMN order_placed BOOLEAN DEFAULT FALSE,
ADD COLUMN order_timestamp DATETIME;
