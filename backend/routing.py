import requests
import pandas as pd
import networkx as nx
from typing import Dict, List, Tuple, Any
import numpy as np
import math
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.util.ref_dirs import get_reference_directions
from pymoo.core.problem import Problem
from pymoo.optimize import minimize
import time
from functools import lru_cache
import pickle
import os.path
import concurrent.futures

# Add this after your imports section
GOODS_TYPE_MULTIPLIER = {
    'perishable': 1.3,
    'hazardous': 1.4,
    'fragile': 1.2,
    'oversized': 1.5,
    'high_value': 1.15,
    'standard': 1.0
}

# Add after the GOODS_TYPE_MULTIPLIER
CO2_FACTORS = {
    "air": 0.5015,  # kgCO2 per kg-km (example, varies per aircraft type)
    "road": 0.1053,  # kgCO2 per km (for medium trucks)
    "sea": 0.0251   # kgCO2 per kg-km
}

def calculate_co2(mode, distance_km, weight_kg):
    if mode in ["road", "air", "sea"]:
        return (distance_km * weight_kg * CO2_FACTORS[mode])/1000
    else:
        raise ValueError("Invalid transport mode")

# Create a cache for geocoded locations
location_cache = {}
country_cache = {}

def geocode_location(location: str) -> tuple:
    """
    Get coordinates for a location using the Nominatim API with persistent caching
    Returns a tuple of (success, coordinates, country)
    """
    # First check in-memory cache
    if location in location_cache:
        return True, location_cache[location], country_cache.get(location, "Unknown")
    
    # Then check persistent cache file
    cache_file = "geocode_cache.pkl"
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'rb') as f:
                cache_data = pickle.load(f)
                if location in cache_data:
                    coords, country = cache_data[location]
                    # Update in-memory cache
                    location_cache[location] = coords
                    country_cache[location] = country
                    return True, coords, country
        except Exception as e:
            print(f"Warning: Could not load cache: {e}")
    
    # If not in cache, make API request (rest of your original code)
    url = f"https://nominatim.openstreetmap.org/search?q={location}&format=json&limit=1&addressdetails=1"
    headers = {'User-Agent': 'MultiModalLogisticsOptimizer/1.0'}
    
    try:
        # Rate limiting (Nominatim requires max 1 request per second)
        time.sleep(1)
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if data and len(data) > 0:
            # Get coordinates (lon,lat format for OSRM)
            lon = data[0]['lon']
            lat = data[0]['lat']
            coords = f"{lon},{lat}"
            
            # Get country
            country = data[0].get('address', {}).get('country', "Unknown")
            
            # Cache for future use
            location_cache[location] = coords
            country_cache[location] = country
            
            # Update persistent cache
            cache_data = {}
            if os.path.exists(cache_file):
                try:
                    with open(cache_file, 'rb') as f:
                        cache_data = pickle.load(f)
                except:
                    pass
            
            cache_data[location] = (coords, country)
            try:
                with open(cache_file, 'wb') as f:
                    pickle.dump(cache_data, f)
            except Exception as e:
                print(f"Warning: Could not save to cache: {e}")
            
            return True, coords, country
        else:
            print(f"Warning: Location '{location}' not found")
            return False, None, None
            
    except Exception as e:
        print(f"Error geocoding {location}: {e}")
        return False, None, None

# -------------------------------------------------------------------------
# DATA LOADING AND PROCESSING FUNCTIONS
# -------------------------------------------------------------------------
def get_road_route(source_coords: str, destination_coords: str) -> Dict[str, Any]:
    """
    Query OSRM to get road route details between two points.
    
    Args:
        source_coords: Source coordinates as "lon,lat"
        destination_coords: Destination coordinates as "lon,lat"
        
    Returns:
        Dictionary with distance_km, time_hr, and cost details
    """
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{source_coords};{destination_coords}?overview=full"
    try:
        response = requests.get(osrm_url)
        data = response.json()
        
        if "routes" in data and len(data["routes"]) > 0:
            distance_km = data["routes"][0]["distance"] / 1000  # Convert meters to km
            time_hr = data["routes"][0]["duration"] / 3600  # Convert seconds to hours
            
            # Cost parameters
            fuel_price_per_liter = 100  # INR per liter
            vehicle_mileage = 12  # km per liter
            driver_cost_per_hour = 150  # INR per hour
            toll_cost_per_km = 1.5  # INR per km (assumed)
            
            # Calculate costs
            fuel_cost = (distance_km / vehicle_mileage) * fuel_price_per_liter
            toll_cost = distance_km * toll_cost_per_km
            driver_wage = time_hr * driver_cost_per_hour
            total_cost = fuel_cost + toll_cost + driver_wage
            
            geometry = data["routes"][0]["geometry"]  # This is encoded polyline
            
            return {
                "distance_km": distance_km,
                "time_hr": time_hr,
                "fuel_cost": fuel_cost,
                "toll_cost": toll_cost,
                "driver_wage": driver_wage,
                "total_cost": total_cost,
                "success": True,
                "geometry": geometry  # Store the polyline for mapping
            }
        else:
            print(f"No route found between {source_coords} and {destination_coords}")
            return {
                "success": False,
                "distance_km": 0,
                "time_hr": 0,
                "fuel_cost": 0,
                "toll_cost": 0,
                "driver_wage": 0,
                "total_cost": 0
            }
    except Exception as e:
        print(f"Error querying OSRM: {e}")
        return {"success": False}

def load_flight_data(filepath: str) -> pd.DataFrame:
    """
    Load flight data from CSV file
    """
    try:
        return pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"Error: Flight data file {filepath} not found.")
        return pd.DataFrame()

def load_shipping_data(filepath: str) -> pd.DataFrame:
    """
    Load shipping data from CSV file
    """
    try:
        return pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"Error: Shipping data file {filepath} not found.")
        return pd.DataFrame()

def load_container_data(filepath: str) -> pd.DataFrame:
    """Load container specifications from CSV file"""
    try:
        df = pd.read_csv(filepath)
        # Ensure numeric conversion for capacity
        df["Weight Capacity (kg)"] = pd.to_numeric(df["Weight Capacity (kg)"], errors='coerce')
        return df
    except FileNotFoundError:
        print(f"Warning: Container data file {filepath} not found")
        return pd.DataFrame()

def get_container_type(mode: str, weight: float, container_df: pd.DataFrame) -> Tuple[str, bool]:
    """
    Determine appropriate container type for given mode and weight.
    Returns (container_type, is_exceeding) tuple.
    """
    # Filter containers for specific mode
    mode_containers = container_df[container_df["Transport Mode"].str.lower() == mode.lower()]
    if mode_containers.empty:
        return "Unknown container type", False
    
    # Sort by capacity to find smallest suitable container
    mode_containers = mode_containers.sort_values("Weight Capacity (kg)")
    
    suitable = mode_containers[mode_containers["Weight Capacity (kg)"] >= weight]
    if suitable.empty:
        max_container = mode_containers.iloc[-1]
        return f"Exceeds {max_container['Container Type']} capacity ({max_container['Weight Capacity (kg)']} kg)", True
    
    return suitable.iloc[0]["Container Type"], False

def load_location_database(filepath="city_coordinates.csv") -> Dict[str, Dict[str, Any]]:
    """
    Load location data from CSV file into a dictionary
    """
    try:
        df = pd.read_csv(filepath)
        location_db = {}
        
        for _, row in df.iterrows():
            key = row['code'] if pd.notna(row['code']) and row['code'] else row['city']
            location_db[key] = {
                'city': row['city'],
                'country': row['country'],
                'type': row['type'],
                'coords': f"{row['lon']},{row['lat']}"  # OSRM uses "lon,lat"
            }
        
        return location_db
    except FileNotFoundError:
        print(f"Warning: Location database file {filepath} not found.")
        return {}

port_coordinates = {
    'Port of Houston': '-95.297241, 29.614658',  # Correct coordinates
    'Port of Seattle-Tacoma': '-122.3375,47.5703',  # Correct port coordinates
    'Port of Jebel Ali': '55.0272904,25.0013084',  # Updated precision
    'Mumbai Port': '72.8321,18.9517',
    'Port of Shanghai': '121.677966,31.230416'
}


def get_location_coords(location: str) -> str:
    """
    Convert location name to coordinates using API with fallbacks
    """
    # If it's already coordinates (lon,lat), return as is
    if "," in location and all(c.replace('.', '', 1).isdigit() or c in ['-', ','] for c in location):
        return location
    
    # Check hardcoded port coordinates first
    if location in port_coordinates:
        return port_coordinates[location]
    
    # Try API geocoding
    success, coords, _ = geocode_location(location)
    if success:
        return coords
    else:
        print(f"Warning: Using default coordinates for {location}")
        return "77.1025,28.7041"  # Default to Delhi

# -------------------------------------------------------------------------
# NETWORK CONSTRUCTION FUNCTIONS
# -------------------------------------------------------------------------
def create_transportation_network(flight_data: pd.DataFrame, shipping_data: pd.DataFrame) -> nx.DiGraph:
    """
    Create a directed graph representing the transportation network
    """
    G = nx.DiGraph()  # Using directed graph since costs/times might differ by direction
    
    # Add flight edges
    for _, row in flight_data.iterrows():
        dep = row["departure_airport"]
        arr = row["arrival_airport"]
        cost = row["cost"]  # cost per kg
        time = row["travel_time"]  # Hours
        
        # Try to get flight distance (assumes CSV has a column "distance_km")
        distance = row["distance_km"] if "distance_km" in row and not pd.isna(row["distance_km"]) else None
        
        dep_country = get_country_for_node(dep)
        arr_country = get_country_for_node(arr)
        
        if dep not in G:
            G.add_node(dep, type="airport", country=dep_country)
        if arr not in G:
            G.add_node(arr, type="airport", country=arr_country)
        
        # Store distance (if available) in the edge attributes
        G.add_edge(dep, arr, mode="air", cost_per_kg=cost, time_hr=time, distance_km=distance)
    
    # Add shipping edges (unchanged)
    for _, row in shipping_data.iterrows():
        dep = row["departure_port"]
        arr = row["arrival_port"]
        cost = row["cost"]  # cost per kg
        time = row["travel_time"] * 24.0  # Convert days to hours
        
        dep_country = get_country_for_node(dep)
        arr_country = get_country_for_node(arr)
        
        if dep not in G:
            G.add_node(dep, type="port", country=dep_country)
        if arr not in G:
            G.add_node(arr, type="port", country=arr_country)
        
        G.add_edge(dep, arr, mode="sea", cost_per_kg=cost, time_hr=time)
    
    return G

def get_country_for_node(node_name: str) -> str:
    """
    Determine country for a node using the API
    """
    # Check if we already have this in cache
    if node_name in country_cache:
        return country_cache[node_name]
    
    # If not, try to geocode it
    success, _, country = geocode_location(node_name)
    if success:
        return country
    
    # Fallback to pattern matching for common nodes
    # (Same pattern matching code as before)
    
    return "Unknown"

def add_coordinates_to_network(G: nx.DiGraph) -> nx.DiGraph:
    """
    Add coordinates to nodes in the network
    """
    for node in G.nodes():
        coords = get_location_coords(node)
        G.nodes[node]['coords'] = coords
    return G

def are_in_same_continent(country1: str, country2: str) -> bool:
    """Check if two countries are on the same continent"""
    continent_map = {
        'India': 'Asia',
        'UAE': 'Asia',
        'China': 'Asia',
        'Singapore': 'Asia',
        'Hong Kong': 'Asia',
        'USA': 'North America',
        'Netherlands': 'Europe',
        'UK': 'Europe'
    }
    
    # Get continents
    continent1 = continent_map.get(country1, 'Unknown')
    continent2 = continent_map.get(country2, 'Unknown')
    
    return continent1 == continent2 and continent1 != 'Unknown'

def is_road_connection_feasible(source_country: str, dest_country: str, distance_km: float) -> bool:
    """
    Determine if a road connection is feasible between two locations
    """
    # If countries are different and on different continents, road connection is impossible
    if source_country != dest_country and not are_in_same_continent(source_country, dest_country):
        return False
        
    # If distance is too large, even within same continent, it's impractical
    if distance_km > 5000:  # Limit for reasonable road travel
        return False
        
    return True

def parallel_road_connections(G, source_node, nodes_to_connect, is_source_to_nodes=True):
    """Process road connections in parallel"""
    results = {}
    source_coords = G.nodes[source_node]['coords']
    
    def process_connection(node):
        node_coords = G.nodes[node]['coords']
        if is_source_to_nodes:
            road_data = get_road_route(source_coords, node_coords)
        else:
            road_data = get_road_route(node_coords, source_coords)
        return node, road_data
    
    # Use ThreadPoolExecutor to parallelize API calls
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_connection, node): node for node in nodes_to_connect}
        
        for future in concurrent.futures.as_completed(futures):
            node, road_data = future.result()
            if road_data["success"]:
                results[node] = road_data
    
    return results

def add_road_connections(G: nx.DiGraph, source: str, destination: str) -> nx.DiGraph:
    """
    Add road connections from source to airports/ports and from airports/ports to destination
    Only add physically possible road connections
    """
    source_coords = get_location_coords(source)
    dest_coords = get_location_coords(destination)
    
    # Determine source and destination countries
    source_country = get_country_for_node(source)
    dest_country = get_country_for_node(destination)
    
    print(f"Adding road connections for {source} ({source_country}) to {destination} ({dest_country})")
    
    # Add source and destination to the graph
    G.add_node(source, type="city", country=source_country, coords=source_coords)
    G.add_node(destination, type="city", country=dest_country, coords=dest_coords)
    
    # Check if direct road connection is feasible
    road_data = get_road_route(source_coords, dest_coords)
    if road_data["success"] and is_road_connection_feasible(source_country, dest_country, road_data["distance_km"]):
        G.add_edge(source, destination, **road_data, mode="road")
        print(f"Added direct road connection: {source} -> {destination} ({road_data['distance_km']:.1f} km)")
    
    # Find nodes in source country
    source_country_nodes = [n for n, data in G.nodes(data=True) 
                           if data.get('country') == source_country and 
                           n != source and n != destination]
    
    # Find nodes in destination country
    dest_country_nodes = [n for n, data in G.nodes(data=True) 
                         if data.get('country') == dest_country and 
                         n != source and n != destination]
    
    print(f"Connecting {source} to {len(source_country_nodes)} nodes in {source_country}")
    # Connect source to nodes in its country
    source_airport_connections = parallel_road_connections(G, source, source_country_nodes, True)
    for node, road_data in source_airport_connections.items():
        G.add_edge(source, node, **road_data, mode="road")
    
    print(f"Connecting {len(dest_country_nodes)} nodes in {dest_country} to {destination}")
    # Connect destination country nodes to destination
    dest_airport_connections = parallel_road_connections(G, destination, dest_country_nodes, False)
    for node, road_data in dest_airport_connections.items():
        G.add_edge(node, destination, **road_data, mode="road")
    
    return G

# -------------------------------------------------------------------------
# ROUTE GENERATION AND EVALUATION FUNCTIONS
# -------------------------------------------------------------------------
def find_multimodal_routes(G: nx.DiGraph, source: str, destination: str, max_routes: int = 20) -> List[List[str]]:
    """
    Find realistic multi-modal routes:
    1. Direct road route if available
    2. Source -> port (road) -> destination (road) if in same continent
    3. Source -> port (road) -> port -> destination (road) for intercontinental travel
    """
    routes = []
    source_country = G.nodes[source].get('country', 'Unknown')
    dest_country = G.nodes[destination].get('country', 'Unknown')
    
    # Check if countries are on the same continent
    same_continent = are_in_same_continent(source_country, dest_country)
    
    print(f"Finding routes from {source} ({source_country}) to {destination} ({dest_country})")
    print(f"Same continent: {same_continent}")
    
    # 1. Check for direct road connection
    if G.has_edge(source, destination) and G[source][destination]['mode'] == 'road':
        print("Direct road route available")
        routes.append([source, destination])
    
    # Get airports/ports in source country with road connections from source
    source_airports = [n for n, data in G.nodes(data=True) 
                      if data.get('country') == source_country and 
                         data.get('type') == 'airport' and
                         G.has_edge(source, n)]
    
    source_seaports = [n for n, data in G.nodes(data=True) 
                      if data.get('country') == source_country and 
                         data.get('type') == 'port' and
                         G.has_edge(source, n)]
    
    # Get airports/ports in destination country with road connections to destination
    dest_airports = [n for n, data in G.nodes(data=True) 
                    if data.get('country') == dest_country and 
                    data.get('type') == 'airport' and
                    G.has_edge(n, destination)]

    dest_seaports = [n for n, data in G.nodes(data=True) 
                    if data.get('country') == dest_country and 
                    data.get('type') == 'port' and
                    G.has_edge(n, destination)]

    # Generate air-sea-air combinations
    for src_airport in source_airports:
        for dest_airport in dest_airports:
            if G.has_edge(src_airport, dest_airport):
                routes.append([source, src_airport, dest_airport, destination])
    
    # Generate sea routes
    for src_port in source_seaports:
        for dest_port in dest_seaports:
            if G.has_edge(src_port, dest_port):
                routes.append([source, src_port, dest_port, destination])
    
    return routes[:max_routes]
    
    print(f"Generated {len(routes)} routes so far")
    
    # 4. If we still need more routes and same continent, try mixed-mode connections
    if len(routes) < max_routes:
        all_src_hubs = source_airports + source_seaports
        all_dst_hubs = dest_airports + dest_seaports
        
        for src_hub in all_src_hubs:
            for dst_hub in all_dst_hubs:
                # Skip if already have this direct connection
                if [source, src_hub, dst_hub, destination] in routes:
                    continue
                    
                # Try to find a path with at most 2 intermediate stops
                try:
                    paths = nx.all_simple_paths(G, src_hub, dst_hub, cutoff=2)
                    for path in paths:
                        if len(path) > 2:  # Only if it's not a direct connection
                            full_path = [source] + path + [destination]
                            if full_path not in routes:
                                routes.append(full_path)
                            if len(routes) >= max_routes:
                                break
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    continue
    
    print(f"Final route count: {len(routes)}")
    return routes[:max_routes]

def evaluate_route(G: nx.DiGraph, route: List[str], cargo_weight: float, goods_type: str) -> Dict[str, Any]:
    """
    Evaluate a route based on total cost, time, and CO2 emissions.
    """
    total_cost = 0
    total_time = 0
    total_distance = 0
    total_emissions = 0
    segments = []
    
    multiplier = GOODS_TYPE_MULTIPLIER.get(goods_type, 1.0)
    
    for i in range(len(route) - 1):
        start = route[i]
        end = route[i+1]
        
        if G.has_edge(start, end):
            edge_data = G[start][end]
            mode = edge_data['mode']
            
            if mode == 'road':
                segment_cost = edge_data['total_cost']
                segment_time = edge_data['time_hr']
                segment_distance = edge_data['distance_km']
                segment_geometry = edge_data.get('geometry', None)
                segment_emissions = calculate_co2(mode, segment_distance, cargo_weight)
            
            elif mode == 'air':
                # Use flight distance from CSV if available; otherwise, estimate using time and an average speed (800 km/h)
                segment_distance = edge_data.get('distance_km', None)
                if segment_distance is None:
                    segment_distance = edge_data['time_hr'] * 800
                segment_cost = edge_data['cost_per_kg'] * cargo_weight
                segment_time = edge_data['time_hr']
                segment_geometry = None
                segment_emissions = calculate_co2(mode, segment_distance, cargo_weight)
            
            elif mode == 'sea':
                segment_cost = edge_data['cost_per_kg'] * cargo_weight
                segment_time = edge_data['time_hr']
                segment_distance = edge_data.get('distance_km', edge_data['time_hr'] * 40)
                segment_geometry = None
                segment_emissions = calculate_co2(mode, segment_distance, cargo_weight)
            
            adjusted_cost = segment_cost * multiplier
            
            goods_impact = 0
            if goods_type == 'perishable':
                goods_impact = segment_cost * 0.3
            elif goods_type == 'hazardous':
                goods_impact = segment_cost * 0.2
            elif goods_type == 'fragile':
                goods_impact = segment_cost * 0.1
            
            customs_cost = 0
            if mode in ['air', 'sea']:
                customs_rate = 0.05
                if goods_type in ['hazardous', 'high_value']:
                    customs_rate = 0.08
                customs_cost = segment_cost * customs_rate
            
            segment_total_cost = adjusted_cost + goods_impact + customs_cost
            
            total_cost += segment_total_cost
            total_time += segment_time
            if mode == 'road':
                total_distance += segment_distance
            total_emissions += segment_emissions
            
            segment_data = {
                'start': start,
                'end': end,
                'mode': mode,
                'distance_km': segment_distance,
                'time_hr': segment_time,
                'base_cost': segment_cost,
                'goods_type_multiplier': multiplier,
                'adjusted_cost': adjusted_cost,
                'goods_impact': goods_impact,
                'customs_cost': customs_cost,
                'total_segment_cost': segment_total_cost,
                'co2_emissions': segment_emissions
            }
            if segment_geometry:
                segment_data['geometry'] = segment_geometry
                
            segments.append(segment_data)
        else:
            print(f"Error: No edge between {start} and {end}")
            return {'valid': False, 'total_cost': float('inf'), 'total_time': float('inf')}
    
    goods_type_score = 0 if goods_type in ['standard', 'raw'] else multiplier * math.sqrt(total_time) * 10
    
    return {
        'valid': True,
        'total_cost': total_cost,
        'total_time': total_time,
        'total_distance': total_distance,
        'total_emissions': total_emissions,
        'goods_type': goods_type,
        'goods_type_score': goods_type_score,
        'segments': segments
    }

# Add this near the top of your file
from functools import lru_cache

# Create a route evaluation cache wrapper
@lru_cache(maxsize=256)
def cached_route_evaluation(route_tuple, cargo_weight, goods_type, G):
    """Cache-friendly wrapper for route evaluation"""
    route = list(route_tuple)
    return evaluate_route(G, route, cargo_weight, goods_type)

# Then modify your route evaluation calls like:
def evaluate_with_cache(G, route, cargo_weight, goods_type):
    """Cached route evaluation"""
    return cached_route_evaluation(tuple(route), cargo_weight, goods_type, G)

# -------------------------------------------------------------------------
# MULTI-OBJECTIVE OPTIMIZATION USING NSGA-III
# -------------------------------------------------------------------------
def optimize_routes_nsga3(G: nx.DiGraph, route_options: List[List[str]], cargo_weight: float, goods_type: str) -> List[Tuple[List[str], Dict[str, Any]]]:
    """
    Apply NSGA-III multi-objective optimization to find Pareto-optimal routes
    Returns multiple optimized routes
    """
    if not route_options:
        print("No routes to optimize!")
        return []
        
    # Create optimization problem
    class RouteOptimizationProblem(Problem):
        def __init__(self, G, routes, cargo_weight, goods_type):
            self.G = G
            self.routes = routes
            self.cargo_weight = cargo_weight
            self.goods_type = goods_type  # Changed from perishability
            
            # Define problem (minimize cost, time, goods type impact)
            super().__init__(n_var=1,
                            n_obj=3,
                            n_constr=0,
                            xl=0,
                            xu=len(routes)-1)
                            
        def _evaluate(self, x, out, *args, **kwargs):
            # Extract decision variables (route indices)
            route_indices = x.astype(int).flatten()
            
            # Initialize objective arrays
            f1 = np.zeros(len(route_indices))  # Cost
            f2 = np.zeros(len(route_indices))  # Time
            f3 = np.zeros(len(route_indices))  # Goods impact
            
            # Evaluate each route
            for i, idx in enumerate(route_indices):
                route = self.routes[idx]
                evaluation = evaluate_route(self.G, route, self.cargo_weight, self.goods_type)
                
                f1[i] = evaluation['total_cost']
                f2[i] = evaluation['total_time']
                
                # Fix: properly set the third objective for standard vs. non-standard goods
                if self.goods_type == 'standard':
                    f3[i] = 0
                else:
                    f3[i] = evaluation['goods_type_score']
            
            # Set objectives (minimize all)
            out["F"] = np.column_stack([f1, f2, f3])

    # Set up the optimization problem
    problem = RouteOptimizationProblem(G, route_options, cargo_weight, goods_type)
    
    # Configure NSGA-III
    ref_dirs = get_reference_directions("das-dennis", 3, n_partitions=12)
    algorithm = NSGA3(pop_size=100, ref_dirs=ref_dirs)
    
    # Run the optimization
    print("\nApplying multi-objective optimization (NSGA-III)...")
    res = minimize(problem,
                   algorithm,
                   ('n_gen', 50),
                   seed=42,
                   verbose=False)
    
    # Get optimized routes with their evaluations
    optimized_routes = []
    for i, x in enumerate(res.X):
        route_idx = int(x[0])
        route = route_options[route_idx]
        evaluation = evaluate_route(G, route, cargo_weight, goods_type)
        optimized_routes.append((route, evaluation))

    existing_routes = {tuple(route) for route, _ in optimized_routes}
    for route in route_options:
        if tuple(route) not in existing_routes:
            evaluation = evaluate_route(G, route, cargo_weight, goods_type)
            optimized_routes.append((route, evaluation))
                  
    return optimized_routes

# -------------------------------------------------------------------------
# TABU SEARCH FOR LOCAL REFINEMENT
# -------------------------------------------------------------------------
def tabu_search(G: nx.DiGraph, initial_route: List[str], cargo_weight: float, goods_type: str, 
                priority_int: int, max_iterations: int = 50, tabu_size: int = 7) -> Tuple[List[str], Dict[str, Any]]:
    """
    Apply Tabu Search to refine a route locally.
    If priority_int==2 (minimize time), it uses total_time only.
    Otherwise, it uses a weighted sum (total_cost + total_time*1000) for selection.
    """
    current_route = initial_route
    current_eval = evaluate_route(G, current_route, cargo_weight, goods_type)
    
    best_route = current_route
    best_eval = current_eval
    
    tabu_list = []  # List of recently visited solutions
    
    for i in range(max_iterations):
        neighbors = []
        
        # Simple neighborhood: try replacing transit hubs
        if len(current_route) >= 4:  # at least one intermediate node
            for pos in range(1, len(current_route) - 1):
                node_type = G.nodes[current_route[pos]].get('type', None)
                if node_type in ['airport', 'port']:
                    # Find potential replacement nodes of the same type (excluding the current)
                    replacements = [n for n, data in G.nodes(data=True)
                                    if data.get('type') == node_type and n != current_route[pos]]
                    for replacement in replacements:
                        # Check if replacing creates valid edges
                        if G.has_edge(current_route[pos-1], replacement) and G.has_edge(replacement, current_route[pos+1]):
                            new_route = current_route[:pos] + [replacement] + current_route[pos+1:]
                            if tuple(new_route) not in tabu_list:
                                new_eval = evaluate_route(G, new_route, cargo_weight, goods_type)
                                if new_eval['valid']:
                                    neighbors.append((new_route, new_eval))
        
        if not neighbors:
            break  # No valid neighbors found
        
        # Select neighbor according to the chosen priority
        if priority_int == 2:
            # For time minimization, sort by total_time only
            neighbors.sort(key=lambda x: x[1]['total_time'])
        else:
            # For cost or balanced, use weighted sum (using time*1000 as before)
            neighbors.sort(key=lambda x: x[1]['total_cost'] + x[1]['total_time'] * 1000)
        
        best_neighbor, best_neighbor_eval = neighbors[0]
        
        # Update current solution
        current_route = best_neighbor
        current_eval = best_neighbor_eval
        
        # Add current solution to tabu list
        tabu_list.append(tuple(current_route))
        if len(tabu_list) > tabu_size:
            tabu_list.pop(0)
        
        # Update best solution (using same objective as neighbor-sorting)
        if priority_int == 2:
            if current_eval['total_time'] < best_eval['total_time']:
                best_route = current_route
                best_eval = current_eval
        else:
            if (current_eval['total_cost'] + current_eval['total_time'] * 1000) < (best_eval['total_cost'] + best_eval['total_time'] * 1000):
                best_route = current_route
                best_eval = current_eval
    
    return best_route, best_eval

# -------------------------------------------------------------------------
# ROUTE RANKING AND VISUALIZATION
# -------------------------------------------------------------------------
def rank_routes(optimized_routes: List[Tuple[List[str], Dict[str, Any]]], priority: int) -> List[Tuple[List[str], Dict[str, Any]]]:
    """
    Rank routes based on priority
    """
    if not optimized_routes:
        return []

    print("Optimized routes:", len(optimized_routes))
    
    # Create a copy to avoid modifying original
    routes_to_rank = optimized_routes.copy()
    
    if priority == 4:  # Minimize emissions
        print("Ranking strictly by CO2 emissions, ascending.")
        sorted_routes = sorted(routes_to_rank, key=lambda x: x[1]['total_emissions'])
    elif priority == 2:  # Minimize time
        print("Ranking strictly by total time, ascending.")
        sorted_routes = sorted(routes_to_rank, key=lambda x: x[1]['total_time'])
    elif priority == 1:  # Minimize cost
        print("Ranking strictly by total cost, ascending.")
        sorted_routes = sorted(routes_to_rank, key=lambda x: x[1]['total_cost'])
    else:  # Balanced
        print("Ranking by normalized combination of cost, time, and emissions.")
        min_cost = min(r[1]['total_cost'] for r in routes_to_rank)
        max_cost = max(r[1]['total_cost'] for r in routes_to_rank)
        min_time = min(r[1]['total_time'] for r in routes_to_rank)
        max_time = max(r[1]['total_time'] for r in routes_to_rank)
        min_emissions = min(r[1]['total_emissions'] for r in routes_to_rank)
        max_emissions = max(r[1]['total_emissions'] for r in routes_to_rank)

        def balanced_score(eval_data):
            norm_cost = ((eval_data['total_cost'] - min_cost) / (max_cost - min_cost)) if max_cost > min_cost else 0
            norm_time = ((eval_data['total_time'] - min_time) / (max_time - min_time)) if max_time > min_time else 0
            norm_emissions = ((eval_data['total_emissions'] - min_emissions) / (max_emissions - min_emissions)) if max_emissions > min_emissions else 0
            return (0.4 * norm_cost) + (0.4 * norm_time) + (0.2 * norm_emissions)
        
        sorted_routes = sorted(routes_to_rank, key=lambda x: balanced_score(x[1]))

    print("Sorted:", len(sorted_routes))
    
    unique_routes = []
    for route in sorted_routes:
        print("->".join(route[0]))
        if route not in unique_routes:
            unique_routes.append(route)

    return unique_routes


def create_vehicle_animation(points, vehicle_type, segment):
    """Create GeoJSON features for vehicle animation"""
    features = []
    
    # Create a feature for each animation frame
    num_frames = min(10, len(points))
    icon_map = {"truck": "truck", "plane": "plane", "ship": "ship"}
    
    for i in range(num_frames):
        # Pick points evenly distributed along the route
        idx = int(i * len(points) / num_frames)
        if idx >= len(points):
            idx = len(points) - 1
        
        point = points[idx]
        
        # Create timestamp (just using sequential days since actual timing isn't important for animation)
        timestamp = f"2023-01-{i+1:02d}"
        
        # Create a feature for this frame
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [point[1], point[0]]  # GeoJSON uses [lon, lat]
            },
            "properties": {
                "time": timestamp,
                "icon": icon_map.get(vehicle_type, "circle"),
                "popup": f"{vehicle_type.capitalize()}: {segment.get('distance_km', 'N/A')} km"
            }
        }
        
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

def create_arc_path(start, end, num_points=10):
    """Create a curved arc path between two points"""
    # Calculate midpoint with elevation
    mid_lat = (start[0] + end[0]) / 2
    mid_lon = (start[1] + end[1]) / 2
    
    # Add curvature based on distance
    dist = ((start[0] - end[0])**2 + (start[1] - end[1])**2)**0.5
    height = dist / 7  # Controls curve height
    
    # Perpendicular direction for curvature
    dx = end[1] - start[1]
    dy = -(end[0] - start[0])
    mag = (dx**2 + dy**2)**0.5
    if mag > 0:
        dx, dy = dx/mag, dy/mag
    
    # Apply curvature
    mid_lat += height * dy
    mid_lon += height * dx
    
    # Generate points along curve
    points = []
    for i in range(num_points + 1):
        t = i / num_points
        lat = (1-t)**2 * start[0] + 2*(1-t)*t * mid_lat + t**2 * end[0]
        lon = (1-t)**2 * start[1] + 2*(1-t)*t * mid_lon + t**2 * end[1]
        points.append([lat, lon])
    
    return points

def print_route_details(route: List[str], evaluation: Dict[str, Any], 
                       cargo_weight: float = 0, container_df: pd.DataFrame = None) -> None:
    """
    Print detailed information about a route
    """
    print("\n" + "=" * 60)
    print(f"Route: {' -> '.join(route)}")
    print("-" * 60)
    print(f"Total Cost: ₹{evaluation['total_cost']:.2f}")
    print(f"Total Time: {evaluation['total_time']:.2f} hours")
    if 'total_distance' in evaluation:
        print(f"Total Distance: {evaluation['total_distance']:.2f} km (road segments only)")
    print(f"Total CO2 Emissions: {evaluation['total_emissions']:.2f} tonnes")
    print(f"Cargo Type: {evaluation['goods_type'].title()}")
    print("-" * 60)
    print("Segment Details:")
    
    for segment in evaluation['segments']:
        print(f"  {segment['start']} -> {segment['end']} ({segment['mode']})")
        
        # Handle different data types for distance
        if isinstance(segment['distance_km'], (int, float)):
            print(f"    Distance: {segment['distance_km']:.2f} km")
        else:
            print(f"    Distance: {segment['distance_km']}")
            
        print(f"    Time: {segment['time_hr']:.2f} hours")
        print(f"    CO2 Emissions: {segment['co2_emissions']:.3f} tonnes")
        print(f"    Base Cost: ₹{segment['base_cost']:.2f}")
        print(f"    {evaluation['goods_type'].title()} Multiplier: {segment['goods_type_multiplier']:.2f}x")
        if segment.get('goods_impact', 0) > 0:
            print(f"    Goods-Specific Impact: ₹{segment['goods_impact']:.2f}")
        if segment.get('customs_cost', 0) > 0:
            print(f"    Customs/Tariff: ₹{segment['customs_cost']:.2f}")
        print(f"    Total Segment Cost: ₹{segment['total_segment_cost']:.2f}")
        
        # Add container information if available
        if container_df is not None and segment['mode'] in ['road', 'air', 'sea']:
            container_type, exceeds = get_container_type(segment['mode'], cargo_weight, container_df)
            print(f"    Container: {container_type}")
            if exceeds:
                print("    WARNING: Cargo weight exceeds container capacity!")
        
        print()

    print("=" * 60)

def print_all_routes(routes_with_evaluations: List[Tuple[List[str], Dict[str, Any]]]) -> None:
    """
    Print details of all possible routes in text format
    """
    print("\n" + "=" * 80)
    print(f"ALL POSSIBLE ROUTES ({len(routes_with_evaluations)} total)")
    print("=" * 80)
    
    for i, (route, evaluation) in enumerate(routes_with_evaluations):
        print(f"\nRoute Option {i+1}: {' -> '.join(route)}")
        print(f"  Total Cost: ₹{evaluation['total_cost']:.2f}")
        print(f"  Total Time: {evaluation['total_time']:.2f} hours")
        print(f"  Total CO2: {evaluation['total_emissions']:.2f} tonnes")
        print(f"  Segments: {len(evaluation['segments'])}")
        
        # Print brief segment info
        for segment in evaluation['segments']:
            print(f"    {segment['start']} -> {segment['end']} ({segment['mode']}): " +
                  f"₹{segment['total_segment_cost']:.2f}, {segment['time_hr']:.1f} hrs, " +
                  f"{segment['co2_emissions']:.3f} tonnes CO2")
    
    print("\n" + "=" * 80)

def get_routing(source: str, destination: str, priority_choice: str, goods_type_choice: str, cargo_weight: float) -> List[Tuple[List[str], Dict[str, Any]]]:
    """
    Main function to run the multi-modal logistics route optimizer
    """
    # Initialize the global location database
    global location_database
    location_database = load_location_database("city_coordinates.csv")
    
    print("Multi-Modal Logistics Route Optimizer")
    print("====================================\n")
    
    priority_int = 3  # Default to balanced

    if priority_choice == "cost":
        priority = "minimize_cost"
        priority_int = 1
    elif priority_choice == "time":
        priority = "minimize_time"
        priority_int = 2
    elif priority_choice == "eco":
        priority = "minimize_emissions"
        priority_int = 4  # New priority number for emissions
    else:
        priority = "weighted"
        priority_int = 3
    
    goods_type_map = {
        "1": "standard",
        "2": "perishable",
        "3": "hazardous", 
        "4": "fragile",
        "5": "oversized",
        "6": "high_value"
    }
     
    goods_type = goods_type_map.get(goods_type_choice, "standard")
    print(f"Selected cargo type: {goods_type.title()} (cost multiplier: {GOODS_TYPE_MULTIPLIER[goods_type]}x)")

    
     # Load data from CSV files
    print("\nLoading transportation data...")
    flights_csv = "cargo_flights (1).csv"
    shipping_csv = "cargo_shipping.csv"
    
    flight_data = load_flight_data(flights_csv)
    shipping_data = load_shipping_data(shipping_csv)
    # Load container data early
    container_df = load_container_data("containers.csv")
    
    if flight_data.empty or shipping_data.empty:
        print("Error: Could not load required data files")
        return
    
    # Build transportation network
    print("Building transportation network...")
    G = create_transportation_network(flight_data, shipping_data)
    
    # Add coordinates to nodes
    print("Adding geographical coordinates...")
    G = add_coordinates_to_network(G)
    
    # Add road connections
    print("Adding road connections...")
    G = add_road_connections(G, source, destination)
    
    # Find multi-modal routes
    print("Generating candidate routes...")
    routes = find_multimodal_routes(G, source, destination)
    
    if not routes:
        print("No routes found between the given source and destination.")
        return
    
    print(f"Found {len(routes)} candidate routes")
    
    # Pre-filter extreme outliers for all priority types
    print("Pre-filtering routes before optimization...")
    route_evaluations = []
    for route in routes:
        evaluation = evaluate_route(G, route, cargo_weight, goods_type)
        if evaluation['valid']:
            route_evaluations.append((route, evaluation))
    
    # Define all_evaluated_routes as a copy of the candidate evaluations—this fixes the missing variable error.
    all_evaluated_routes = route_evaluations.copy()
    
    if route_evaluations:
        min_cost = min(route_evaluations, key=lambda x: x[1]['total_cost'])[1]['total_cost']
        min_time = min(route_evaluations, key=lambda x: x[1]['total_time'])[1]['total_time']
        min_emissions = min(route_evaluations, key=lambda x: x[1]['total_emissions'])[1]['total_emissions']

        filtered_routes = []
        
        if priority == "minimize_emissions":
            # Include routes with emissions up to 8x the minimum
            for route, eval in route_evaluations:
                if eval['total_emissions'] <= min_emissions * 8:
                    filtered_routes.append(route)
        elif priority == "minimize_time":
            for route, eval in route_evaluations:
                if eval['total_time'] <= min_time * 2:
                    filtered_routes.append(route)
        elif priority == "minimize_cost":
            for route, eval in route_evaluations:
                if eval['total_cost'] <= min_cost * 3:
                    filtered_routes.append(route)
        else:  # Balanced
            for route, eval in route_evaluations:
                if (eval['total_cost'] <= min_cost * 5 or 
                    eval['total_time'] <= min_time * 3 or 
                    eval['total_emissions'] <= min_emissions * 5):
                    filtered_routes.append(route)

        # Always ensure we have at least 3 routes
        if len(filtered_routes) < 3 and route_evaluations:
            print("Warning: Too few routes after filtering. Adding back some routes...")
            if priority == "minimize_emissions":
                # Sort remaining routes by emissions for eco-priority
                remaining_routes = sorted(
                    [(r[0], r[1]['total_emissions']) for r in route_evaluations if r[0] not in filtered_routes],
                    key=lambda x: x[1]
                )
                filtered_routes.extend([r[0] for r in remaining_routes[:3 - len(filtered_routes)]])
            else:
                remaining_routes = [r[0] for r in route_evaluations if r[0] not in filtered_routes]
                filtered_routes.extend(remaining_routes[:3 - len(filtered_routes)])

        print(f"Pre-filtered from {len(routes)} to {len(filtered_routes)} routes")
        routes = filtered_routes

    # Apply NSGA-III optimization
    print("\nApplying multi-objective optimization (NSGA-III)...")
    optimized_routes = optimize_routes_nsga3(G, routes, cargo_weight, goods_type)
    
    if not optimized_routes:
        print("No feasible routes found after optimization.")
        return
    
    print(f"Optimization complete: {len(optimized_routes)} Pareto-optimal routes identified")
    
    # Apply Tabu Search for local refinement
    print("\nApplying local refinement (Tabu Search)...")
    refined_routes = []
    for route, evaluation in optimized_routes:
        refined_route, refined_eval = tabu_search(G, route, cargo_weight, goods_type, priority_int)
        refined_routes.append((refined_route, refined_eval))
    
    print("Local refinement complete:", len(refined_routes))
    
    # Rank routes based on user priority using refined_routes
    print(f"\nRanking routes based on priority: {priority}")
    ranked_routes = rank_routes(refined_routes, priority_int)

    print("Ranking complete:", len(ranked_routes))
    
    # Remove duplicate routes (same nodes in same order)
    unique_ranked_routes = []
    seen_routes = set()
    for route, evaluation in ranked_routes:
        route_str = "→".join(route)
        print(route_str)
        print(seen_routes)
        if route_str not in seen_routes:
            seen_routes.add(route_str)
            unique_ranked_routes.append((route, evaluation))

    # If we have fewer than 3 refined routes, supplement from candidate routes.
    if priority_int == 2 and len(unique_ranked_routes) < 3:
        sorted_candidates = sorted(all_evaluated_routes, key=lambda x: x[1]['total_time'])
        for route, evaluation in sorted_candidates:
            route_str = "→".join(route)
            if route_str not in seen_routes and len(unique_ranked_routes) < 3:
                unique_ranked_routes.append((route, evaluation))
                seen_routes.add(route_str)
    elif priority_int == 1 and len(unique_ranked_routes) < 3:
        sorted_candidates = sorted(all_evaluated_routes, key=lambda x: x[1]['total_cost'])
        for route, evaluation in sorted_candidates:
            route_str = "→".join(route)
            if route_str not in seen_routes and len(unique_ranked_routes) < 3:
                unique_ranked_routes.append((route, evaluation))
                seen_routes.add(route_str)
    elif priority_int == 4 and len(unique_ranked_routes) < 3:  # For emissions priority
        sorted_candidates = sorted(all_evaluated_routes, key=lambda x: x[1]['total_emissions'])
        for route, evaluation in sorted_candidates:
            route_str = "→".join(route)
            if route_str not in seen_routes and len(unique_ranked_routes) < 3:
                unique_ranked_routes.append((route, evaluation))
                seen_routes.add(route_str)

    # After duplicate removal:
    # 'unique_ranked_routes' now holds the routes in the order produced by rank_routes.
    # To ensure the order remains consistent, re-sort based on the objective:
    if priority_int == 1:
        unique_ranked_routes.sort(key=lambda x: x[1]['total_cost'])
    elif priority_int == 2:
        unique_ranked_routes.sort(key=lambda x: x[1]['total_time'])
    elif priority_int == 4:
        unique_ranked_routes.sort(key=lambda x: x[1]['total_emissions'])
    else:
        # For balanced, recompute balanced score over the unique set
        min_cost = min(r[1]['total_cost'] for r in unique_ranked_routes)
        max_cost = max(r[1]['total_cost'] for r in unique_ranked_routes)
        min_time = min(r[1]['total_time'] for r in unique_ranked_routes)
        max_time = max(r[1]['total_time'] for r in unique_ranked_routes)
        min_emissions = min(r[1]['total_emissions'] for r in unique_ranked_routes)
        max_emissions = max(r[1]['total_emissions'] for r in unique_ranked_routes)
        
        def balanced_score(eval_data):
            norm_cost = ((eval_data['total_cost'] - min_cost) / (max_cost - min_cost)) if max_cost > min_cost else 0
            norm_time = ((eval_data['total_time'] - min_time) / (max_time - min_time)) if max_time > min_time else 0
            norm_emissions = ((eval_data['total_emissions'] - min_emissions) / (max_emissions - min_emissions)) if max_emissions > min_emissions else 0
            return (0.4 * norm_cost) + (0.4 * norm_time) + (0.2 * norm_emissions)
        
        unique_ranked_routes.sort(key=lambda x: balanced_score(x[1]))
    
    print_all_routes(all_evaluated_routes)
    
    # Now container_df is available when we call print_route_details
    for i, (route, evaluation) in enumerate(unique_ranked_routes):
        print(f"\nROUTE OPTION {i+1}:")
        print_route_details(route, evaluation, cargo_weight, container_df)
    
    print("\nOptimization complete! Review the route details above and check the generated map.")

    for i, (route, evaluation) in enumerate(unique_ranked_routes):
        segments_with_coordinates = []

        evaluation["modes"] = []

        for j in range(len(route) - 1):
            segment = next((s for s in evaluation['segments']
                            if s['start'] == route[j] and s['end'] == route[j + 1]), None)

            if segment:
                start_coords_str = G.nodes[route[j]]['coords'].split(',')
                end_coords_str = G.nodes[route[j + 1]]['coords'].split(',')

                start_lon = float(start_coords_str[0])
                start_lat = float(start_coords_str[1])
                end_lon = float(end_coords_str[0])
                end_lat = float(end_coords_str[1])

                segment['coordinates'] = [
                    (start_lat, start_lon), (end_lat, end_lon)
                ]

                if segment["mode"] not in evaluation["modes"]:
                    evaluation["modes"].append(segment["mode"])

                segments_with_coordinates.append(segment)

        unique_ranked_routes[i][1]["segments"] = segments_with_coordinates

    return unique_ranked_routes
