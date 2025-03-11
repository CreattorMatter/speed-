-- Create the carousels table
CREATE TABLE IF NOT EXISTS carousels (
    id TEXT PRIMARY KEY,
    images JSONB NOT NULL,
    interval_time INTEGER NOT NULL DEFAULT 3,
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    devices TEXT[] NOT NULL,
    sucursales TEXT[] NOT NULL,
    empresa_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on empresa_id for faster queries
CREATE INDEX IF NOT EXISTS idx_carousels_empresa_id ON carousels(empresa_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_carousels_updated_at
    BEFORE UPDATE ON carousels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE carousels ENABLE ROW LEVEL SECURITY;

-- Create policies for different operations
CREATE POLICY "Enable read access for all users" ON carousels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON carousels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON carousels
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON carousels
    FOR DELETE USING (auth.role() = 'authenticated'); 