-- Migration to add supplier columns to requests table
-- Run this SQL script to add the new supplier columns

ALTER TABLE requests 
ADD COLUMN supplierName VARCHAR(100) NULL,
ADD COLUMN supplierPhone VARCHAR(20) NULL,
ADD COLUMN supplierEmail VARCHAR(100) NULL;

-- Add comments to document the purpose of these columns
ALTER TABLE requests 
MODIFY COLUMN supplierName VARCHAR(100) NULL COMMENT 'Name of the supplier when order is placed',
MODIFY COLUMN supplierPhone VARCHAR(20) NULL COMMENT 'Phone number of the supplier when order is placed',
MODIFY COLUMN supplierEmail VARCHAR(100) NULL COMMENT 'Email address of the supplier when order is placed';