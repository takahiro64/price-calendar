-- Flight Price Tracker Database Schema
-- PostgreSQL 15+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create flight_route table (路線情報)
CREATE TABLE IF NOT EXISTS flight_route (
    id SERIAL PRIMARY KEY,
    departure VARCHAR(10) NOT NULL,
    arrival VARCHAR(10) NOT NULL,
    airline VARCHAR(50),
    flight_code VARCHAR(20),
    departure_date DATE NOT NULL,
    transit VARCHAR(100),
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 同一便の重複登録防止
    CONSTRAINT unique_route UNIQUE (departure, arrival, departure_date, airline)
);

-- Create price_history table (日次価格履歴)
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    price INTEGER NOT NULL,
    source_site VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_route
        FOREIGN KEY (route_id)
        REFERENCES flight_route(id)
        ON DELETE CASCADE,
    
    -- 同日二重登録防止
    CONSTRAINT unique_daily_price UNIQUE (route_id, record_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_flight_route_departure_date ON flight_route(departure_date);
CREATE INDEX idx_flight_route_departure_arrival ON flight_route(departure, arrival);
CREATE INDEX idx_price_history_route_id ON price_history(route_id);
CREATE INDEX idx_price_history_record_date ON price_history(record_date);
CREATE INDEX idx_price_history_route_date ON price_history(route_id, record_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for flight_route
CREATE TRIGGER update_flight_route_updated_at
    BEFORE UPDATE ON flight_route
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO flight_route (departure, arrival, airline, flight_code, departure_date, memo)
-- VALUES
--     ('HND', 'CTS', 'ANA', 'NH51', '2025-12-01', '冬旅'),
--     ('HND', 'OKA', 'JAL', 'JL901', '2025-11-20', '沖縄旅行'),
--     ('NRT', 'ITM', 'Peach', 'MM101', '2025-11-25', 'LCC利用');
