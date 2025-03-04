INSERT INTO route (name, mode, distance, travel_time, start_point, end_point, created_at) VALUES
('Delhi to Beijing AIR Route', 'AIR', 3000, 6, ST_SetSRID(ST_MakePoint(77.1025, 28.6139), 4326), ST_SetSRID(ST_MakePoint(116.4074, 39.9042), 4326), CURRENT_TIMESTAMP),
('Mumbai to Shanghai SEA Route', 'SEA', 5000, 15, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326), ST_SetSRID(ST_MakePoint(121.4737, 31.2304), 4326), CURRENT_TIMESTAMP),
('Kolkata to Guangzhou GROUND Route', 'GROUND', 2000, 30, ST_SetSRID(ST_MakePoint(88.3639, 22.5726), 4326), ST_SetSRID(ST_MakePoint(113.2644, 23.1291), 4326), CURRENT_TIMESTAMP),
('Chennai to Shenzhen AIR Route', 'AIR', 3500, 7, ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), ST_SetSRID(ST_MakePoint(114.0579, 22.5431), 4326), CURRENT_TIMESTAMP),
('Hyderabad to Hangzhou GROUND Route', 'GROUND', 4000, 35, ST_SetSRID(ST_MakePoint(78.4744, 17.3850), 4326), ST_SetSRID(ST_MakePoint(120.1551, 30.2741), 4326), CURRENT_TIMESTAMP),
('Beijing to Delhi AIR Route', 'AIR', 3000, 6, ST_SetSRID(ST_MakePoint(116.4074, 39.9042), 4326), ST_SetSRID(ST_MakePoint(77.1025, 28.6139), 4326), CURRENT_TIMESTAMP),
('Shanghai to Mumbai SEA Route', 'SEA', 5000, 15, ST_SetSRID(ST_MakePoint(121.4737, 31.2304), 4326), ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326), CURRENT_TIMESTAMP),
('Guangzhou to Kolkata GROUND Route', 'GROUND', 2000, 30, ST_SetSRID(ST_MakePoint(113.2644, 23.1291), 4326), ST_SetSRID(ST_MakePoint(88.3639, 22.5726), 4326), CURRENT_TIMESTAMP),
('Shenzhen to Chennai AIR Route', 'AIR', 3500, 7, ST_SetSRID(ST_MakePoint(114.0579, 22.5431), 4326), ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), CURRENT_TIMESTAMP),
('Hangzhou to Hyderabad GROUND Route', 'GROUND', 4000, 35, ST_SetSRID(ST_MakePoint(120.1551, 30.2741), 4326), ST_SetSRID(ST_MakePoint(78.4744, 17.3850), 4326), CURRENT_TIMESTAMP);
