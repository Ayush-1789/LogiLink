# LogiLink: Multi-Modal Logistics Route Optimizer

## Overview

LogiLink is a powerful route optimization system designed to find the most efficient transportation routes for cargo. It considers multiple modes of transport (road, air, sea) and optimizes based on user-defined priorities such as cost, time, or CO2 emissions. The system provides detailed route information, including segment-specific data, costs, time, emissions, and suggested container types.

## Features

*   **Multi-Modal Routing:** Combines road, air, and sea transport options.
*   **Multi-Objective Optimization:** Optimizes routes based on cost, time, CO2 emissions, or a balanced approach.
*   **Detailed Route Evaluation:** Provides comprehensive metrics for each route, including cost, time, distance, emissions, and cargo-specific considerations.
*   **Interactive Visualization:** Generates maps to visualize the top recommended routes.
*   **Container Optimization:** Suggests appropriate container types based on cargo weight and transport mode.

## Technologies Used

*   **Python:** Core programming language.
*   **NetworkX:** For graph creation and analysis of transportation networks.
*   **Pandas:** For data manipulation and analysis (e.g., loading CSV data).
*   **Pymoo:** For multi-objective optimization using **NSGA-III** (Non-dominated Sorting Genetic Algorithm III). NSGA-III is used to find a set of Pareto-optimal solutions when dealing with multiple, often conflicting, objectives like minimizing cost, time, and emissions simultaneously. It helps in exploring diverse trade-offs.
*   **Folium:** For generating interactive map visualizations.
*   **Tabu Search:** A metaheuristic local search algorithm used for refining the routes found by NSGA-III. It helps to escape local optima and find better quality solutions by exploring the solution space more thoroughly, preventing recently visited solutions from being revisited.


## Getting Started

### Prerequisites

*   Git
*   Python 3.9+ and Pip
*   Node.js and npm (or yarn)
*   A running instance of PostgreSQL with the PostGIS extension enabled. You will need to configure the database connection details in the backend application (e.g., in a configuration file or environment variables).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd LogiLink
    ```

2.  **Set up the Backend:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Create a Python virtual environment:
        ```bash
        python -m venv .venv
        ```
    *   Activate the virtual environment:
        *   On Windows:
            ```bash
            .\.venv\Scripts\activate
            ```
        *   On macOS/Linux:
            ```bash
            source .venv/bin/activate
            ```
    *   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Ensure your PostgreSQL database is running and accessible. You may need to update database connection strings in the backend code (e.g., `backend/database.py` or a configuration file) to point to your PostgreSQL instance.

3.  **Set up the Frontend:**
    *   Navigate to the frontend directory (from the root of the project):
        ```bash
        cd frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        # or
        # yarn install
        ```

## Running the Application

1.  **Start the Backend API:**
    *   Ensure you are in the `backend` directory and your virtual environment is activated.
    *   Run the FastAPI development server:
        ```bash
        fastapi dev main.py
        ```
    *   The API will typically be available at `http://127.0.0.1:8000`.

2.  **Start the Frontend Development Server:**
    *   Ensure you are in the `frontend` directory.
    *   Run the Vite development server:
        ```bash
        npm run dev
        # or
        # yarn dev
        ```
    *   The frontend application will typically be available at `http://localhost:5173` (or another port indicated by Vite).

## Sample Output (Backend Console)

python routing.py

```
Multi-Modal Logistics Route Optimizer
====================================

Please enter the following information:
Source location (city name or coordinates): Ahmedabad
Destination location (city name or coordinates): Dubai

Optimization priority:
[cost] Minimize Cost
[time] Minimize Time
[eco] Minimize CO2 Emissions
[balanced] Balanced Optimization
Enter your choice [cost/time/eco/balanced]: cost

Cargo type:
1. Standard
2. Perishable
3. Hazardous
4. Fragile
5. Oversized
6. High Value
Select cargo type (1-6): 1
Selected cargo type: Standard (cost multiplier: 1.0x)

Cargo weight (kg): 100
Maximum delivery time (days): 50

Loading transportation data...
Building transportation network...
Adding geographical coordinates...
Adding road connections...
Adding road connections for Ahmedabad (India) to Dubai (الإمارات العربية المتحدة)
Connecting Ahmedabad to 13 nodes in India
Connecting 4 nodes in الإمارات العربية المتحدة to Dubai
Generating candidate routes...
Finding routes from Ahmedabad (India) to Dubai (الإمارات العربية المتحدة)
Same continent: False
Found 10 candidate routes
Pre-filtering routes before optimization...
Warning: Too few routes after filtering. Adding back some routes...
Pre-filtered from 10 to 3 routes

Applying multi-objective optimization (NSGA-III)...

Applying multi-objective optimization (NSGA-III)...
Optimization complete: 2 Pareto-optimal routes identified

Applying local refinement (Tabu Search)...
Local refinement complete

Ranking routes based on priority: minimize_cost
Ranking strictly by total cost, ascending.

================================================================================
ALL POSSIBLE ROUTES (10 total)
================================================================================

Route Option 1: Ahmedabad -> BOM -> DXB -> Dubai
  Total Cost: ₹41135.10
  Total Time: 9.36 hours (0.4 days)
  Total CO2: 102.41 tonnes

Top 3 recommended routes:

ROUTE OPTION 1:

============================================================
Route: Ahmedabad -> Mundra Port -> Port Rashid -> Dubai
------------------------------------------------------------
Total Cost: ₹5757.34
Total Time: 126.89 hours (5.3 days)
Total Distance: 404.22 km (road segments only)
Total CO2 Emissions: 16.30 tonnes
Cargo Type: Standard
------------------------------------------------------------
Segment Details:
  Ahmedabad -> Mundra Port (road)
    Distance: 373.96 km
    Time: 6.42 hours
    CO2 Emissions: 3.938 tonnes
    Base Cost: ₹4639.98
    Standard Multiplier: 1.00x
    Total Segment Cost: ₹4639.98
    Container: 20ft Container

  Mundra Port -> Port Rashid (sea)
    Distance: 4800.00 km
    Time: 120.00 hours
    CO2 Emissions: 12.048 tonnes
    Base Cost: ₹713.00
    Standard Multiplier: 1.00x
    Customs/Tariff: ₹35.65
    Total Segment Cost: ₹748.65
    Container: 20ft TEU

  Port Rashid -> Dubai (road)
    Distance: 30.26 km
    Time: 0.47 hours
    CO2 Emissions: 0.319 tonnes
    Base Cost: ₹368.72
    Standard Multiplier: 1.00x
    Total Segment Cost: ₹368.72
    Container: 20ft Container

============================================================
... (ROUTE OPTION 2 and 3) ...

Generating visualization for top routes...
Map with top 3 routes saved to top_routes_map.html

Optimization complete! Review the route details above and check the generated map.

## Sample Route Visualization

Below is an example of the map generated by LogiLink, showing the optimized routes:

![Top Routes Visualization](./assets/image.png)

```


---
