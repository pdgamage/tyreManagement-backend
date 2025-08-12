-- Add cost_centre and department columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN cost_centre VARCHAR(50),
ADD COLUMN department VARCHAR(50);

-- Update existing vehicles with default values if needed
UPDATE vehicles v
JOIN users u ON v.registered_by = u.id
SET v.cost_centre = u.cost_centre,
    v.department = u.department
WHERE v.cost_centre IS NULL 
   OR v.department IS NULL;
