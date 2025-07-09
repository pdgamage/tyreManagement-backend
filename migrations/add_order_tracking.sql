-- Add order tracking columns to requests table
ALTER TABLE requests 
ADD COLUMN order_status ENUM('pending', 'placed') DEFAULT 'pending',
ADD COLUMN order_placed_date DATETIME NULL,
ADD COLUMN selected_supplier_id INT NULL,
ADD CONSTRAINT fk_selected_supplier FOREIGN KEY (selected_supplier_id) REFERENCES supplier(id);
