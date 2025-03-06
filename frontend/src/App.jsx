import { useState } from "react";
import "./App.css";
import Map from "./Map.jsx";
import { useWeather } from "./Weather";

function App() {
  // State for form inputs
  const [shipmentDetails, setShipmentDetails] = useState({
    origin: "",
    destination: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    priority: "balanced", // Default priority
    hazardous: false,
    perishable: false,
    value: "",
    description: "",
  });

  // State for route results
  const [routeOptions, setRouteOptions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showDetailedRoute, setShowDetailedRoute] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (dimensions)
      const [parent, child] = name.split(".");
      setShipmentDetails((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setShipmentDetails((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real application, this would call an API
    // For demo purposes, we'll simulate some route options
    const mockRoutes = [
      // Existing routes
      {
        id: 1,
        modes: ["Sea", "Land"],
        cost: 1250.5,
        transitTime: 14,
        co2Emissions: "Medium",
        reliability: "High",
        borderCrossings: 2,
        category: "cost", // Most cost-effective option
        // Added detailed route information
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Rotterdam Port, Netherlands",
            to_coords: [51.9225, 4.47917],
            mode: "Land",
            vehicle: "Truck LM-4500",
            company: "EuroFreight Logistics",
            departure: "2023-06-15 08:30",
            arrival: "2023-06-15 14:45",
            duration: "6h 15m",
            distance: "320 km",
            borderCrossing: shipmentDetails.origin.includes("Germany")
              ? "Germany-Netherlands"
              : null,
          },
          {
            from: "Rotterdam Port, Netherlands",
            from_coords: [51.9225, 4.47917],
            to: "New York Harbor, USA",
            to_coords: [40.7128, -74.006],
            mode: "Sea",
            vehicle: "Container Ship MS Atlantic Explorer",
            company: "Maersk Line",
            departure: "2023-06-16 10:00",
            arrival: "2023-06-28 07:30",
            duration: "11d 21h 30m",
            distance: "5,850 km",
            vesselDetails: {
              capacity: "15,000 TEU",
              route: "TA1 - Transatlantic",
              registration: "IMO 9398335",
            },
          },
          {
            from: "New York Harbor, USA",
            from_coords: [40.7128, -74.006],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck FH-9870",
            company: "American Road Logistics",
            departure: "2023-06-29 09:15",
            arrival: "2023-06-29 15:40",
            duration: "6h 25m",
            distance: "285 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 2,
        modes: ["Air"],
        cost: 2500.75,
        transitTime: 3,
        co2Emissions: "High",
        reliability: "Very High",
        borderCrossings: 1,
        category: "speed", // Fastest delivery option
        // Added detailed route information
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Frankfurt Airport (FRA), Germany",
            to_coords: [50.1109, 8.6821],
            mode: "Land",
            vehicle: "Truck MX-2050",
            company: "SpeedLogistics",
            departure: "2023-06-15 11:00",
            arrival: "2023-06-15 13:45",
            duration: "2h 45m",
            distance: "180 km",
            borderCrossing: null,
          },
          {
            from: "Frankfurt Airport (FRA), Germany",
            from_coords: [50.1109, 8.6821],
            to: "JFK Airport (JFK), New York, USA",
            to_coords: [40.6413, -73.7781],
            mode: "Air",
            vehicle: "Boeing 777F Cargo",
            company: "Lufthansa Cargo",
            departure: "2023-06-15 19:45",
            arrival: "2023-06-16 02:30",
            duration: "8h 45m",
            distance: "6,200 km",
            flightDetails: {
              flightNumber: "LH8400",
              aircraft: "Boeing 777F",
              registration: "D-ALFA",
            },
            borderCrossing: "EU-USA Customs",
          },
          {
            from: "JFK Airport (JFK), New York, USA",
            from_coords: [40.6413, -73.7781],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck FH-9870",
            company: "American Road Logistics",
            departure: "2023-06-16 06:30",
            arrival: "2023-06-16 09:15",
            duration: "2h 45m",
            distance: "150 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 3,
        modes: ["Land", "Sea", "Land"],
        cost: 950.25,
        transitTime: 21,
        co2Emissions: "Low",
        reliability: "Medium",
        borderCrossings: 3,
        category: "eco", // Eco-friendly option
        // Added detailed route information
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Berlin Logistics Hub, Germany",
            to_coords: [52.52, 13.405],
            mode: "Land",
            vehicle: "Train Euro Cargo Express",
            company: "DB Cargo",
            departure: "2023-06-15 14:30",
            arrival: "2023-06-15 20:15",
            duration: "5h 45m",
            distance: "450 km",
            borderCrossing: null,
            trainDetails: {
              trainNumber: "CE-4502",
              carriageNumber: "C08",
            },
          },
          {
            from: "Berlin Logistics Hub, Germany",
            from_coords: [52.52, 13.405],
            to: "Hamburg Port, Germany",
            to_coords: [53.5511, 9.9937],
            mode: "Land",
            vehicle: "Truck VT-8900",
            company: "Deutsche LogistikGruppe",
            departure: "2023-06-16 07:00",
            arrival: "2023-06-16 10:30",
            duration: "3h 30m",
            distance: "290 km",
            borderCrossing: null,
          },
          {
            from: "Hamburg Port, Germany",
            from_coords: [53.5511, 9.9937],
            to: "Montreal Harbor, Canada",
            to_coords: [45.5088, -73.554],
            mode: "Sea",
            vehicle: "Container Ship MS Nordic Voyager",
            company: "MSC Mediterranean Shipping",
            departure: "2023-06-17 16:00",
            arrival: "2023-06-30 08:45",
            duration: "12d 16h 45m",
            distance: "6,100 km",
            vesselDetails: {
              capacity: "9,500 TEU",
              route: "TA3 - North Atlantic",
              registration: "IMO 9754127",
            },
          },
          {
            from: "Montreal Harbor, Canada",
            from_coords: [45.5088, -73.554],
            to: "US-Canada Border Crossing",
            to_coords: [45.4215, -75.6972],
            mode: "Land",
            vehicle: "Truck CM-4520",
            company: "CanAm Logistics",
            departure: "2023-07-01 09:30",
            arrival: "2023-07-01 13:45",
            duration: "4h 15m",
            distance: "220 km",
            borderCrossing: "Canada-USA",
          },
          {
            from: "US-Canada Border Crossing",
            from_coords: [45.4215, -75.6972],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck US-7720",
            company: "American Road Logistics",
            departure: "2023-07-01 15:00",
            arrival: "2023-07-01 19:30",
            duration: "4h 30m",
            distance: "310 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 4,
        modes: ["Land"],
        cost: 1850.75,
        transitTime: 18,
        co2Emissions: "Medium",
        reliability: "High",
        borderCrossings: 4,
        category: "balanced",
        // Added detailed route information for land-only option
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Berlin, Germany",
            to_coords: [52.52, 13.405],
            mode: "Land",
            vehicle: "Truck VT-8800",
            company: "Deutsche LogistikGruppe",
            departure: "2023-06-15 06:30",
            arrival: "2023-06-15 12:45",
            duration: "6h 15m",
            distance: "410 km",
            borderCrossing: null,
          },
          {
            from: "Berlin, Germany",
            from_coords: [52.52, 13.405],
            to: "Warsaw, Poland",
            to_coords: [52.2297, 21.0122],
            mode: "Land",
            vehicle: "Truck VT-8800",
            company: "Deutsche LogistikGruppe",
            departure: "2023-06-15 14:00",
            arrival: "2023-06-15 20:30",
            duration: "6h 30m",
            distance: "575 km",
            borderCrossing: "Germany-Poland",
          },
          {
            from: "Warsaw, Poland",
            from_coords: [52.2297, 21.0122],
            to: "Moscow, Russia",
            to_coords: [55.7558, 37.6176],
            mode: "Land",
            vehicle: "Truck VT-8800",
            company: "EuroAsian Logistics",
            departure: "2023-06-16 08:00",
            arrival: "2023-06-17 18:30",
            duration: "1d 10h 30m",
            distance: "1,250 km",
            borderCrossing: "Poland-Belarus, Belarus-Russia",
          },
          {
            from: "Moscow, Russia",
            from_coords: [55.7558, 37.6176],
            to: "Vladivostok, Russia",
            to_coords: [43.1167, 131.8833],
            mode: "Land",
            vehicle: "Train Trans-Siberian Express",
            company: "Russian Railways",
            departure: "2023-06-18 10:45",
            arrival: "2023-06-25 14:20",
            duration: "7d 3h 35m",
            distance: "9,200 km",
            borderCrossing: null,
            trainDetails: {
              trainNumber: "TS-0092",
              carriageNumber: "F17",
            },
          },
          {
            from: "Vladivostok, Russia",
            from_coords: [43.1167, 131.8833],
            to: "Beijing, China",
            to_coords: [39.9042, 116.4074],
            mode: "Land",
            vehicle: "Truck AS-5600",
            company: "AsiaRoute Logistics",
            departure: "2023-06-26 08:00",
            arrival: "2023-06-28 19:15",
            duration: "2d 11h 15m",
            distance: "1,850 km",
            borderCrossing: "Russia-China",
          },
          {
            from: "Beijing, China",
            from_coords: [39.9042, 116.4074],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck CN-2280",
            company: "China Express",
            departure: "2023-06-29 10:30",
            arrival: "2023-06-30 16:45",
            duration: "1d 6h 15m",
            distance: "950 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 5,
        modes: ["Sea"],
        cost: 1100.25,
        transitTime: 28,
        co2Emissions: "Low",
        reliability: "Medium",
        borderCrossings: 0,
        category: "eco",
        // Added detailed route information for sea-only option
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Hamburg Port, Germany",
            to_coords: [53.5511, 9.9937],
            mode: "Land",
            vehicle: "Truck DT-4500",
            company: "Deutsche LogistikGruppe",
            departure: "2023-06-15 08:00",
            arrival: "2023-06-15 14:30",
            duration: "6h 30m",
            distance: "380 km",
            borderCrossing: null,
          },
          {
            from: "Hamburg Port, Germany",
            from_coords: [53.5511, 9.9937],
            to: "Suez Canal, Egypt",
            to_coords: [30.0286, 32.5499],
            mode: "Sea",
            vehicle: "Container Ship MS Europa",
            company: "Maersk Line",
            departure: "2023-06-16 13:00",
            arrival: "2023-06-23 10:45",
            duration: "6d 21h 45m",
            distance: "7,800 km",
            vesselDetails: {
              capacity: "18,000 TEU",
              route: "AE1 - Asia-Europe",
              registration: "IMO 9632064",
            },
          },
          {
            from: "Suez Canal, Egypt",
            from_coords: [30.0286, 32.5499],
            to: "Singapore Port, Singapore",
            to_coords: [1.3521, 103.8198],
            mode: "Sea",
            vehicle: "Container Ship MS Europa",
            company: "Maersk Line",
            departure: "2023-06-24 09:30",
            arrival: "2023-07-06 16:20",
            duration: "12d 6h 50m",
            distance: "8,600 km",
            vesselDetails: {
              capacity: "18,000 TEU",
              route: "AE1 - Asia-Europe",
              registration: "IMO 9632064",
            },
          },
          {
            from: "Singapore Port, Singapore",
            from_coords: [1.3521, 103.8198],
            to: "Shanghai Port, China",
            to_coords: [31.2304, 121.4737],
            mode: "Sea",
            vehicle: "Container Ship MS Europa",
            company: "Maersk Line",
            departure: "2023-07-07 14:00",
            arrival: "2023-07-12 08:30",
            duration: "4d 18h 30m",
            distance: "4,200 km",
            vesselDetails: {
              capacity: "18,000 TEU",
              route: "AE1 - Asia-Europe",
              registration: "IMO 9632064",
            },
          },
          {
            from: "Shanghai Port, China",
            from_coords: [31.2304, 121.4737],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck CN-9900",
            company: "China Express",
            departure: "2023-07-13 10:00",
            arrival: "2023-07-13 17:45",
            duration: "7h 45m",
            distance: "520 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 6,
        modes: ["Air"],
        cost: 2750.8,
        transitTime: 4,
        co2Emissions: "High",
        reliability: "High",
        borderCrossings: 2,
        category: "balanced",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Munich Airport (MUC), Germany",
            to_coords: [48.3537, 11.7750],
            mode: "Land",
            vehicle: "Electric Truck E-3500",
            company: "GreenLogistics",
            departure: "2023-06-15 09:00",
            arrival: "2023-06-15 12:30",
            duration: "3h 30m",
            distance: "230 km",
            borderCrossing: null,
          },
          {
            from: "Munich Airport (MUC), Germany",
            from_coords: [48.3537, 11.7750],
            to: "Dubai International (DXB), UAE",
            to_coords: [25.2532, 55.3657],
            mode: "Air",
            vehicle: "Airbus A330F",
            company: "Emirates SkyCargo",
            departure: "2023-06-15 17:30",
            arrival: "2023-06-16 01:15",
            duration: "5h 45m",
            distance: "4,600 km",
            flightDetails: {
              flightNumber: "EK9842",
              aircraft: "Airbus A330F",
              registration: "A6-EFC",
            },
            borderCrossing: "EU-UAE Customs",
          },
          {
            from: "Dubai International (DXB), UAE",
            from_coords: [25.2532, 55.3657],
            to: "Newark Liberty (EWR), USA",
            to_coords: [40.6895, -74.1745],
            mode: "Air",
            vehicle: "Boeing 777F",
            company: "Emirates SkyCargo",
            departure: "2023-06-16 03:40",
            arrival: "2023-06-16 10:20",
            duration: "14h 40m",
            distance: "11,020 km",
            flightDetails: {
              flightNumber: "EK9201",
              aircraft: "Boeing 777F",
              registration: "A6-EFF",
            },
            borderCrossing: "UAE-USA Customs",
          },
          {
            from: "Newark Liberty (EWR), USA",
            from_coords: [40.6895, -74.1745],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck FT-7200",
            company: "Fast Track Delivery",
            departure: "2023-06-16 13:00",
            arrival: "2023-06-16 16:45",
            duration: "3h 45m",
            distance: "180 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 7,
        modes: ["Air", "Land"],
        cost: 2200.5,
        transitTime: 5,
        co2Emissions: "Medium-High",
        reliability: "High",
        borderCrossings: 2,
        category: "balanced",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Paris Charles de Gaulle (CDG), France",
            to_coords: [49.0097, 2.5479],
            mode: "Land",
            vehicle: "Truck EU-5511",
            company: "Euro Express Freight",
            departure: "2023-06-15 07:15",
            arrival: "2023-06-15 13:30",
            duration: "6h 15m",
            distance: "455 km",
            borderCrossing: "Germany-France",
          },
          {
            from: "Paris Charles de Gaulle (CDG), France",
            from_coords: [49.0097, 2.5479],
            to: "Chicago O'Hare (ORD), USA",
            to_coords: [41.9742, -87.9073],
            mode: "Air",
            vehicle: "Boeing 747-8F",
            company: "Air France Cargo",
            departure: "2023-06-15 18:20",
            arrival: "2023-06-15 21:30",
            duration: "9h 10m",
            distance: "6,670 km",
            flightDetails: {
              flightNumber: "AF8230",
              aircraft: "Boeing 747-8F",
              registration: "F-GITH",
            },
            borderCrossing: "EU-USA Customs",
          },
          {
            from: "Chicago O'Hare (ORD), USA",
            from_coords: [41.9742, -87.9073],
            to: "Chicago Union Station",
            to_coords: [41.8781, -87.6298],
            mode: "Land",
            vehicle: "Truck US-3300",
            company: "Cross City Transit",
            departure: "2023-06-16 08:00",
            arrival: "2023-06-16 09:15",
            duration: "1h 15m",
            distance: "45 km",
            borderCrossing: null,
          },
          {
            from: "Chicago Union Station",
            from_coords: [41.8781, -87.6298],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Rail Cargo Express",
            company: "Amtrak Freight",
            departure: "2023-06-16 11:30",
            arrival: "2023-06-17 14:45",
            duration: "1d 3h 15m",
            distance: "1,200 km",
            trainDetails: {
              trainNumber: "AC-7702",
              carriageNumber: "F22",
            },
            borderCrossing: null,
          },
        ],
      },
      {
        id: 8,
        modes: ["Land"],
        cost: 1450.3,
        transitTime: 12,
        co2Emissions: "Low",
        reliability: "Medium-High",
        borderCrossings: 3,
        category: "eco",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Frankfurt Rail Terminal, Germany",
            to_coords: [50.1109, 8.6821],
            mode: "Land",
            vehicle: "Truck DL-6620",
            company: "Deutsche LogistikGruppe",
            departure: "2023-06-15 08:45",
            arrival: "2023-06-15 11:30",
            duration: "2h 45m",
            distance: "160 km",
            borderCrossing: null,
          },
          {
            from: "Frankfurt Rail Terminal, Germany",
            from_coords: [50.1109, 8.6821],
            to: "Paris Gare du Nord, France",
            to_coords: [48.8809, 2.3553],
            mode: "Land",
            vehicle: "Deutsche Bahn Cargo Train",
            company: "DB Schenker",
            departure: "2023-06-15 14:00",
            arrival: "2023-06-15 19:15",
            duration: "5h 15m",
            distance: "480 km",
            trainDetails: {
              trainNumber: "DB-9051",
              carriageNumber: "C14",
            },
            borderCrossing: "Germany-France",
          },
          {
            from: "Paris Gare du Nord, France",
            from_coords: [48.8809, 2.3553],
            to: "London St Pancras, UK",
            to_coords: [51.5322, -0.1275],
            mode: "Land",
            vehicle: "Eurostar Cargo Train",
            company: "Eurostar Logistics",
            departure: "2023-06-16 07:30",
            arrival: "2023-06-16 09:01",
            duration: "1h 31m",
            distance: "453 km",
            trainDetails: {
              trainNumber: "ES-7920",
              carriageNumber: "D03",
            },
            borderCrossing: "France-UK",
          },
          {
            from: "London St Pancras, UK",
            from_coords: [51.5322, -0.1275],
            to: "Liverpool Port, UK",
            to_coords: [53.4106, -3.0044],
            mode: "Land",
            vehicle: "UK Rail Cargo Express",
            company: "GB Railfreight",
            departure: "2023-06-16 10:30",
            arrival: "2023-06-16 14:45",
            duration: "4h 15m",
            distance: "340 km",
            trainDetails: {
              trainNumber: "GB-4402",
              carriageNumber: "B21",
            },
            borderCrossing: null,
          },
          {
            from: "Liverpool Port, UK",
            from_coords: [53.4106, -3.0044],
            to: "Halifax Port, Canada",
            to_coords: [44.6488, -63.5752],
            mode: "Sea",
            vehicle: "Container Ship MS Atlantic Voyager",
            company: "Hapag-Lloyd",
            departure: "2023-06-17 10:00",
            arrival: "2023-06-24 08:30",
            duration: "6d 22h 30m",
            distance: "4,700 km",
            vesselDetails: {
              capacity: "10,500 TEU",
              route: "North Atlantic Express",
              registration: "IMO 9731987",
            },
          },
          {
            from: "Halifax Port, Canada",
            from_coords: [44.6488, -63.5752],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Canadian National Railway",
            company: "CN Rail",
            departure: "2023-06-24 14:00",
            arrival: "2023-06-27 16:30",
            duration: "3d 2h 30m",
            distance: "1,850 km",
            trainDetails: {
              trainNumber: "CN-5501",
              carriageNumber: "A09",
            },
            borderCrossing: "Canada-USA",
          },
        ],
      },
      {
        id: 9,
        modes: ["Air", "Land"],
        cost: 3100.9,
        transitTime: 2,
        co2Emissions: "High",
        reliability: "Very High",
        borderCrossings: 1,
        category: "specialized",
        specializedFor: "perishable",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Amsterdam Schiphol (AMS), Netherlands",
            to_coords: [52.3105, 4.7683],
            mode: "Land",
            vehicle: "Refrigerated Truck RF-5500",
            company: "ColdChain Logistics",
            departure: "2023-06-15 06:00",
            arrival: "2023-06-15 10:30",
            duration: "4h 30m",
            distance: "280 km",
            borderCrossing: "Germany-Netherlands",
            refrigerated: true,
            temperature: "-2°C to +2°C",
          },
          {
            from: "Amsterdam Schiphol (AMS), Netherlands",
            from_coords: [52.3105, 4.7683],
            to: "Atlanta Hartsfield (ATL), USA",
            to_coords: [33.6407, -84.4277],
            mode: "Air",
            vehicle: "Boeing 777-200F",
            company: "Delta Cargo",
            departure: "2023-06-15 14:15",
            arrival: "2023-06-15 18:30",
            duration: "10h 15m",
            distance: "7,100 km",
            flightDetails: {
              flightNumber: "DL9821",
              aircraft: "Boeing 777-200F",
              registration: "N705GT",
            },
            borderCrossing: "EU-USA Customs",
            refrigerated: true,
            temperature: "0°C to +4°C",
          },
          {
            from: "Atlanta Hartsfield (ATL), USA",
            from_coords: [28.4257, 48.4887],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Refrigerated Truck KW-8800",
            company: "US Cold Transport",
            departure: "2023-06-15 20:00",
            arrival: "2023-06-16 05:45",
            duration: "9h 45m",
            distance: "550 km",
            borderCrossing: null,
            refrigerated: true,
            temperature: "-2°C to +2°C",
          },
        ],
      },
      {
        id: 10,
        modes: ["Air", "Land"],
        cost: 3950.0,
        transitTime: 2,
        co2Emissions: "High",
        reliability: "Very High",
        borderCrossings: 1,
        category: "specialized",
        specializedFor: "high-value",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Zurich Airport (ZRH), Switzerland",
            to_coords: [47.4647, 8.5492],
            mode: "Land",
            vehicle: "Armored Truck SV-2200",
            company: "SecureVault Transport",
            departure: "2023-06-15 08:00",
            arrival: "2023-06-15 13:45",
            duration: "5h 45m",
            distance: "350 km",
            borderCrossing: "Germany-Switzerland",
            security: "Armed guards, GPS tracking, real-time monitoring",
          },
          {
            from: "Zurich Airport (ZRH), Switzerland",
            from_coords: [47.4647, 8.5492],
            to: "New York JFK (JFK), USA",
            to_coords: [40.6413, -73.7781],
            mode: "Air",
            vehicle: "Swiss Secure Air Transport",
            company: "SWISS WorldCargo",
            departure: "2023-06-15 17:30",
            arrival: "2023-06-15 20:45",
            duration: "9h 15m",
            distance: "6,400 km",
            flightDetails: {
              flightNumber: "LX8800",
              aircraft: "Airbus A330-300",
              registration: "HB-JHK",
            },
            borderCrossing: "Switzerland-USA Customs",
            security: "Dedicated secure cargo area, constant surveillance",
          },
          {
            from: "New York JFK (JFK), USA",
            from_coords: [40.6413, -73.7781],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Armored Truck BT-6600",
            company: "Brink's Security Transport",
            departure: "2023-06-15 22:30",
            arrival: "2023-06-16 03:15",
            duration: "4h 45m",
            distance: "270 km",
            borderCrossing: null,
            security: "Armed escort, secure communication, route monitoring",
          },
        ],
      },
      {
        id: 11,
        modes: ["Sea"],
        cost: 1050.8,
        transitTime: 25,
        co2Emissions: "Low",
        reliability: "Medium",
        borderCrossings: 0,
        category: "eco",
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Antwerp Port, Belgium",
            to_coords: [51.2465, 4.4056],
            mode: "Land",
            vehicle: "Electric Truck EC-5500",
            company: "EcoFreight",
            departure: "2023-06-15 09:30",
            arrival: "2023-06-15 16:15",
            duration: "6h 45m",
            distance: "370 km",
            borderCrossing: "Germany-Belgium",
          },
          {
            from: "Antwerp Port, Belgium",
            from_coords: [51.2465, 4.4056],
            to: "Panama Canal, Panama",
            to_coords: [9.0800, -79.6800],
            mode: "Sea",
            vehicle: "Container Ship MS Green Pioneer",
            company: "CMA CGM",
            departure: "2023-06-16 15:00",
            arrival: "2023-06-27 09:30",
            duration: "10d 18h 30m",
            distance: "8,450 km",
            vesselDetails: {
              capacity: "14,000 TEU",
              route: "Atlantic-Pacific Express",
              registration: "IMO 9839272",
            },
          },
          {
            from: "Panama Canal, Panama",
            from_coords: [9.0800, -79.6800],
            to: "Long Beach Port, USA",
            to_coords: [33.7701, -118.1937],
            mode: "Sea",
            vehicle: "Container Ship MS Green Pioneer",
            company: "CMA CGM",
            departure: "2023-06-28 05:00",
            arrival: "2023-07-08 11:45",
            duration: "10d 6h 45m",
            distance: "5,900 km",
            vesselDetails: {
              capacity: "14,000 TEU",
              route: "Atlantic-Pacific Express",
              registration: "IMO 9839272",
            },
          },
          {
            from: "Long Beach Port, USA",
            from_coords: [33.7701, -118.1937],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Hybrid Truck HT-6200",
            company: "West Coast Green Logistics",
            departure: "2023-07-09 08:00",
            arrival: "2023-07-10 15:30",
            duration: "1d 7h 30m",
            distance: "780 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 12,
        modes: ["Air"],
        cost: 1950.5, // Cheaper air option to be cost-effective when filtering for air only
        transitTime: 3.5,
        co2Emissions: "High",
        reliability: "High",
        borderCrossings: 1,
        category: "cost", // Mark as cost-effective for air
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Berlin Tegel (TXL), Germany",
            to_coords: [52.5548, 13.2925],
            mode: "Land",
            vehicle: "Electric Van GE-2200",
            company: "Berlin Express Logistics",
            departure: "2023-06-15 06:00",
            arrival: "2023-06-15 08:30",
            duration: "2h 30m",
            distance: "150 km",
            borderCrossing: null,
          },
          {
            from: "Berlin Tegel (TXL), Germany",
            from_coords: [52.5548, 13.2925],
            to: "London Heathrow (LHR), UK",
            to_coords: [51.4700, -0.4543],
            mode: "Air",
            vehicle: "Airbus A300F",
            company: "Eurocargo Airways",
            departure: "2023-06-15 11:45",
            arrival: "2023-06-15 13:15",
            duration: "1h 30m",
            distance: "950 km",
            flightDetails: {
              flightNumber: "EC4501",
              aircraft: "Airbus A300F",
              registration: "G-EURC",
            },
            borderCrossing: "EU-UK Customs",
          },
          {
            from: "London Heathrow (LHR), UK",
            from_coords: [51.4700, -0.4543],
            to: "New York JFK (JFK), USA",
            to_coords: [40.6413, -73.7781],
            mode: "Air",
            vehicle: "Boeing 747F",
            company: "TransAtlantic Cargo",
            departure: "2023-06-15 15:30",
            arrival: "2023-06-15 18:45",
            duration: "7h 15m",
            distance: "5,550 km",
            flightDetails: {
              flightNumber: "TA2098",
              aircraft: "Boeing 747F",
              registration: "G-TACB",
            },
            borderCrossing: "UK-USA Customs",
          },
          {
            from: "New York JFK (JFK), USA",
            from_coords: [40.6413, -73.7781],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck US-8877",
            company: "East Coast Logistics",
            departure: "2023-06-15 21:00",
            arrival: "2023-06-16 01:30",
            duration: "4h 30m",
            distance: "280 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 13,
        modes: ["Air"],
        cost: 2250.25,
        transitTime: 2.5, // Faster than other air options to be fastest when filtering air only
        co2Emissions: "High",
        reliability: "Very High",
        borderCrossings: 1,
        category: "speed", // Mark as fastest for air
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Frankfurt Airport (FRA), Germany",
            to_coords: [50.0379, 8.5622],
            mode: "Land",
            vehicle: "High-Speed Logistics Van",
            company: "Express Connect",
            departure: "2023-06-15 05:30",
            arrival: "2023-06-15 08:00",
            duration: "2h 30m",
            distance: "220 km",
            borderCrossing: null,
          },
          {
            from: "Frankfurt Airport (FRA), Germany",
            from_coords: [50.0379, 8.5622],
            to: "New York JFK (JFK), USA",
            to_coords: [40.6413, -73.7781],
            mode: "Air",
            vehicle: "Boeing 777X-F",
            company: "Lufthansa Premium Cargo",
            departure: "2023-06-15 10:15",
            arrival: "2023-06-15 13:40",
            duration: "7h 25m",
            distance: "6,200 km",
            flightDetails: {
              flightNumber: "LH8800",
              aircraft: "Boeing 777X-F",
              registration: "D-ALFT",
            },
            borderCrossing: "EU-USA Customs",
            expedited: true,
            priority: "Ultra Priority",
          },
          {
            from: "New York JFK (JFK), USA",
            from_coords: [40.6413, -73.7781],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Premium Delivery Van",
            company: "JFK Express Couriers",
            departure: "2023-06-15 15:00",
            arrival: "2023-06-15 17:45",
            duration: "2h 45m",
            distance: "150 km",
            borderCrossing: null,
            expedited: true,
          },
        ],
      },
      {
        id: 14,
        modes: ["Sea"],
        cost: 950.5, // Cheapest sea option
        transitTime: 26,
        co2Emissions: "Low",
        reliability: "Medium",
        borderCrossings: 0,
        category: "cost", // Mark as cost-effective for sea
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Rotterdam Port, Netherlands",
            to_coords: [51.9225, 4.47917],
            mode: "Land",
            vehicle: "Truck RT-2233",
            company: "Euro Container Transport",
            departure: "2023-06-15 07:00",
            arrival: "2023-06-15 14:00",
            duration: "7h 00m",
            distance: "410 km",
            borderCrossing: "Germany-Netherlands",
          },
          {
            from: "Rotterdam Port, Netherlands",
            from_coords: [51.9225, 4.47917],
            to: "Boston Harbor, USA",
            to_coords: [42.3601, -71.0589],
            mode: "Sea",
            vehicle: "Container Ship MS Northern Star",
            company: "Maersk Economy Line",
            departure: "2023-06-16 13:00",
            arrival: "2023-06-30 15:30",
            duration: "14d 2h 30m",
            distance: "5,200 km",
            vesselDetails: {
              capacity: "12,000 TEU",
              route: "North Atlantic Budget Route",
              registration: "IMO 9528392",
            },
          },
          {
            from: "Boston Harbor, USA",
            from_coords: [42.3601, -71.0589],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck US-4411",
            company: "Northeast Cargo Transport",
            departure: "2023-07-01 08:00",
            arrival: "2023-07-01 15:30",
            duration: "7h 30m",
            distance: "350 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 15,
        modes: ["Sea"],
        cost: 1250.75,
        transitTime: 19, // Faster sea option
        co2Emissions: "Low-Medium",
        reliability: "High",
        borderCrossings: 0,
        category: "speed", // Mark as fastest for sea
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Hamburg Port, Germany",
            to_coords: [53.5511, 9.9937],
            mode: "Land",
            vehicle: "Truck HH-9980",
            company: "North German Logistics",
            departure: "2023-06-15 05:30",
            arrival: "2023-06-15 10:45",
            duration: "5h 15m",
            distance: "320 km",
            borderCrossing: null,
          },
          {
            from: "Hamburg Port, Germany",
            from_coords: [53.5511, 9.9937],
            to: "New York Harbor, USA",
            to_coords: [40.7128, -74.0060],
            mode: "Sea",
            vehicle: "High-Speed Container Vessel MV Express Atlantic",
            company: "Hapag-Lloyd Express",
            departure: "2023-06-16 08:00",
            arrival: "2023-06-25 14:30",
            duration: "9d 6h 30m",
            distance: "5,850 km",
            vesselDetails: {
              capacity: "8,000 TEU",
              route: "Express Atlantic Route",
              registration: "IMO 9712426",
              category: "High-Speed Vessel",
            },
          },
          {
            from: "New York Harbor, USA",
            from_coords: [40.7128, -74.0060],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck FF-7744",
            company: "Fast Forward Logistics",
            departure: "2023-06-25 17:00",
            arrival: "2023-06-25 22:15",
            duration: "5h 15m",
            distance: "290 km",
            borderCrossing: null,
          },
        ],
      },
      {
        id: 16,
        modes: ["Land"],
        cost: 1250.3, // Cheaper land option
        transitTime: 16,
        co2Emissions: "Medium",
        reliability: "High",
        borderCrossings: 3,
        category: "cost", // Mark as cost-effective for land
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Warsaw, Poland",
            to_coords: [52.2297, 21.0122],
            mode: "Land",
            vehicle: "EcoTruck PL-5500",
            company: "Green Road Logistics",
            departure: "2023-06-15 04:30",
            arrival: "2023-06-15 19:45",
            duration: "15h 15m",
            distance: "990 km",
            borderCrossing: "Germany-Poland",
            trainDetails: {
              trainNumber: "ET-1207",
              carriageNumber: "G22",
            },
          },
          {
            from: "Warsaw, Poland",
            from_coords: [52.2297, 21.0122],
            to: "Brest, Belarus",
            to_coords: [52.0975, 23.6877],
            mode: "Land",
            vehicle: "Rail Cargo Connect",
            company: "EuroAsian Rail",
            departure: "2023-06-16 06:00",
            arrival: "2023-06-16 14:30",
            duration: "8h 30m",
            distance: "550 km",
            borderCrossing: "Poland-Belarus",
            trainDetails: {
              trainNumber: "EAC-8801",
              carriageNumber: "D05",
            },
          },
          {
            from: "Brest, Belarus",
            from_coords: [52.0975, 23.6877],
            to: "Moscow, Russia",
            to_coords: [55.7558, 37.6176],
            mode: "Land",
            vehicle: "Rail Cargo Express",
            company: "Russian Railways",
            departure: "2023-06-16 16:00",
            arrival: "2023-06-17 10:30",
            duration: "18h 30m",
            distance: "1,050 km",
            borderCrossing: "Belarus-Russia",
            trainDetails: {
              trainNumber: "RU-1104",
              carriageNumber: "H11",
            },
          },
          {
            from: "Moscow, Russia",
            from_coords: [55.7558, 37.6176],
            to: "Vladivostok, Russia",
            to_coords: [43.1167, 131.8833],
            mode: "Land",
            vehicle: "Trans-Siberian Railway Budget Express",
            company: "Russian Railways",
            departure: "2023-06-18 08:00",
            arrival: "2023-06-25 15:30",
            duration: "7d 7h 30m",
            distance: "9,200 km",
            trainDetails: {
              trainNumber: "TS-9900",
              carriageNumber: "E22",
            },
          },
          {
            from: "Vladivostok, Russia",
            from_coords: [43.1167, 131.8833],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "Truck VL-2244",
            company: "Far East Logistics",
            departure: "2023-06-26 06:00",
            arrival: "2023-07-01 15:45",
            duration: "5d 9h 45m",
            distance: "2,200 km",
            borderCrossing: "Russia-China",
          },
        ],
      },
      {
        id: 17,
        modes: ["Land"],
        cost: 1650.8,
        transitTime: 10, // Faster land option
        co2Emissions: "Medium-High",
        reliability: "Very High",
        borderCrossings: 2,
        category: "speed", // Mark as fastest for land
        detailedRoute: [
          {
            from: shipmentDetails.origin,
            from_coords: [51.5074, 0.1278],
            to: "Berlin, Germany",
            to_coords: [52.52, 13.405],
            mode: "Land",
            vehicle: "High-Speed Transfer Van",
            company: "Berlin Express",
            departure: "2023-06-15 05:00",
            arrival: "2023-06-15 09:30",
            duration: "4h 30m",
            distance: "390 km",
            borderCrossing: null,
          },
          {
            from: "Berlin, Germany",
            from_coords: [52.52, 13.405],
            to: "Budapest, Hungary",
            to_coords: [47.4979, 19.0402],
            mode: "Land",
            vehicle: "Express Train Central Europe",
            company: "EU Express Railways",
            departure: "2023-06-15 11:00",
            arrival: "2023-06-15 17:45",
            duration: "6h 45m",
            distance: "870 km",
            borderCrossing: "Germany-Austria-Hungary",
            trainDetails: {
              trainNumber: "EC-3300",
              carriageNumber: "A01",
              category: "High-Speed",
            },
          },
          {
            from: "Budapest, Hungary",
            from_coords: [47.4979, 19.0402],
            to: "Istanbul, Turkey",
            to_coords: [41.0082, 28.9784],
            mode: "Land",
            vehicle: "Express Train Eastern Europe",
            company: "EuroTurk Railways",
            departure: "2023-06-15 19:30",
            arrival: "2023-06-16 09:15",
            duration: "13h 45m",
            distance: "1,050 km",
            borderCrossing: "Hungary-Serbia-Bulgaria-Turkey",
            trainDetails: {
              trainNumber: "ET-5500",
              carriageNumber: "B07",
            },
          },
          {
            from: "Istanbul, Turkey",
            from_coords: [41.0082, 28.9784],
            to: shipmentDetails.destination,
            to_coords: [51.5074, 0.1278],
            mode: "Land",
            vehicle: "High-Speed Rail Express",
            company: "Trans-Asian Railway Network",
            departure: "2023-06-16 12:00",
            arrival: "2023-06-25 16:30",
            duration: "9d 4h 30m",
            distance: "6,500 km",
            trainDetails: {
              trainNumber: "TAR-8809",
              carriageNumber: "S11",
              category: "Premium Express",
            },
          },
        ],
      },
    ];

    setRouteOptions(mockRoutes);
    setActiveFilter("all");
    setShowResults(true);
  };

  // Return to form
  const handleBack = () => {
    if (showDetailedRoute) {
      setShowDetailedRoute(false);
      setSelectedRoute(null);
    } else {
      setShowResults(false);
    }
  };

  // Handle route selection
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setShowDetailedRoute(true);
  };

  // Calculate total details for the selected route
  const calculateRouteStats = (detailedRoute) => {
    let totalDistance = 0;
    let totalBorderCrossings = 0;

    detailedRoute.forEach((segment) => {
      totalDistance += parseInt(segment.distance.replace(/,/g, ""));
      if (segment.borderCrossing) totalBorderCrossings += 1;
    });

    return { totalDistance, totalBorderCrossings };
  };

  // Filter routes based on user selection
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Get filtered and organized routes
  const getFilteredRoutes = () => {
    if (activeFilter === "all") {
      return routeOptions;
    } else if (activeFilter === "air") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Air"),
      );
    } else if (activeFilter === "sea") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Sea"),
      );
    } else if (activeFilter === "land") {
      return routeOptions.filter(
        (route) => route.modes.length === 1 && route.modes.includes("Land"),
      );
    } else {
      return routeOptions;
    }
  };

  // Get featured routes (fastest and most cost-effective) based on current filter
  const getFeaturedRoutes = () => {
    // First, get the filtered routes based on the active filter
    const filteredRoutes = getFilteredRoutes();

    // From the filtered routes, find the fastest option
    const fastest = filteredRoutes.reduce((fastestRoute, currentRoute) => {
      if (
        !fastestRoute ||
        currentRoute.transitTime < fastestRoute.transitTime
      ) {
        return currentRoute;
      }
      return fastestRoute;
    }, null);

    // From the filtered routes, find the most cost-effective option
    const costEffective = filteredRoutes.reduce(
      (cheapestRoute, currentRoute) => {
        if (!cheapestRoute || currentRoute.cost < cheapestRoute.cost) {
          return currentRoute;
        }
        return cheapestRoute;
      },
      null,
    );

    // If the fastest and most cost-effective are the same, just return one
    if (fastest && costEffective && fastest.id === costEffective.id) {
      return [{ ...fastest, category: "speed" }]; // Use one with speed category
    }

    // Modify the categories to ensure proper display
    const result = [];
    if (fastest) {
      result.push({ ...fastest, category: "speed" });
    }
    if (costEffective) {
      result.push({ ...costEffective, category: "cost" });
    }

    return result;
  };

  // Get regular routes (exclude featured ones) based on current filter
  const getRegularRoutes = () => {
    // First, get all routes that match the current filter
    const filteredRoutes = getFilteredRoutes();

    // Get the IDs of the featured routes
    const featuredRoutes = getFeaturedRoutes();
    const featuredIds = featuredRoutes.map((r) => r.id);

    // Return all filtered routes that aren't featured
    return filteredRoutes.filter((r) => !featuredIds.includes(r.id));
  };

  // Add this function inside your App component
  const handleClearForm = () => {
    setShipmentDetails({
      origin: "",
      destination: "",
      weight: "",
      dimensions: { length: "", width: "", height: "" },
      priority: "balanced", // Reset to default priority
      hazardous: false,
      perishable: false,
      value: "",
      description: "",
    });
  };

  // Weather information display component - add this within your App component
  function LocationWeather({ coords, location }) {
    const { weatherData, loading, error } = useWeather(coords[0], coords[1]);

    if (!coords) return null;
    
    return (
      <div className="location-weather">
        <h4 className="weather-location-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 5.4A4 4 0 0 1 12 4a4 4 0 0 1 4 1.4"></path>
            <path d="M4 10h.01"></path>
            <path d="M20 10h.01"></path>
            <path d="M12 14a6 6 0 0 0-6-6h-.01a6 6 0 0 0-6 6h12.01A6 6 0 0 0 18 8h-.01a6 6 0 0 0-6 6"></path>
          </svg>
          Current Weather at {location}
        </h4>
        
        {loading ? (
          <div className="weather-loading">Loading weather data...</div>
        ) : error ? (
          <div className="weather-error">Weather data unavailable</div>
        ) : weatherData ? (
          <div className="weather-data-grid">
            <div className="weather-data-item">
              <span className="weather-data-label">Temperature</span>
              <span className="weather-data-value">{weatherData.current.temperature2m}°C</span>
            </div>
            
            <div className="weather-data-item">
              <span className="weather-data-label">Rain</span>
              <span className="weather-data-value">
                {weatherData.current.rain} mm
              </span>
            </div>
            
            {weatherData.current.showers > 0 && (
              <div className="weather-data-item">
                <span className="weather-data-label">Showers</span>
                <span className="weather-data-value">{weatherData.current.showers} mm</span>
              </div>
            )}
            
            {weatherData.current.snowfall > 0 && (
              <div className="weather-data-item">
                <span className="weather-data-label">Snowfall</span>
                <span className="weather-data-value">{weatherData.current.snowfall} cm</span>
              </div>
            )}
          </div>
        ) : (
          <div className="weather-error">No weather data available</div>
        )}
      </div>
    );
  }

  return (
    <div className="shipping-app">
      <header>
        <h1>LogiRoute Optimizer</h1>
        <p>Find the optimal shipping route for your cross-border cargo</p>
      </header>

      {!showResults ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-card">
              <h2 className="section-title">Shipment Details</h2>

              <div className="form-section">
                <div className="form-row two-columns">
                  <div className="form-field">
                    <label htmlFor="origin">Origin</label>
                    <input
                      type="text"
                      id="origin"
                      name="origin"
                      value={shipmentDetails.origin}
                      onChange={handleChange}
                      placeholder="City, Country"
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="destination">Destination</label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={shipmentDetails.destination}
                      onChange={handleChange}
                      placeholder="City, Country"
                      required
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h2 className="section-title">Cargo Specifications</h2>

              <div className="form-section">
                <div className="form-row two-columns">
                  <div className="form-field">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={shipmentDetails.weight}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                      className="input-field"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="value">Value (USD)</label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={shipmentDetails.value}
                      onChange={handleChange}
                      min="0"
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field full-width">
                    <label>Dimensions (cm)</label>
                    <div className="dimensions-container">
                      <div className="dimension-field">
                        <label htmlFor="length">Length</label>
                        <input
                          type="number"
                          id="length"
                          name="dimensions.length"
                          value={shipmentDetails.dimensions.length}
                          onChange={handleChange}
                          min="0"
                          className="input-field"
                          placeholder="0"
                        />
                      </div>
                      <div className="dimension-field">
                        <label htmlFor="width">Width</label>
                        <input
                          type="number"
                          id="width"
                          name="dimensions.width"
                          value={shipmentDetails.dimensions.width}
                          onChange={handleChange}
                          min="0"
                          className="input-field"
                          placeholder="0"
                        />
                      </div>
                      <div className="dimension-field">
                        <label htmlFor="height">Height</label>
                        <input
                          type="number"
                          id="height"
                          name="dimensions.height"
                          value={shipmentDetails.dimensions.height}
                          onChange={handleChange}
                          min="0"
                          className="input-field"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field full-width">
                    <label htmlFor="description">Cargo Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={shipmentDetails.description}
                      onChange={handleChange}
                      rows="3"
                      className="input-field textarea"
                      placeholder="Brief description of your cargo"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field full-width checkbox-container">
                    <label className="checkbox-group-label">
                      Special Requirements
                    </label>
                    <div className="checkbox-group">
                      <div className="checkbox-field">
                        <input
                          type="checkbox"
                          id="hazardous"
                          name="hazardous"
                          checked={shipmentDetails.hazardous}
                          onChange={handleChange}
                        />
                        <label htmlFor="hazardous">Hazardous Materials</label>
                      </div>
                      <div className="checkbox-field">
                        <input
                          type="checkbox"
                          id="perishable"
                          name="perishable"
                          checked={shipmentDetails.perishable}
                          onChange={handleChange}
                        />
                        <label htmlFor="perishable">Perishable Goods</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h2 className="section-title">Shipping Preferences</h2>

              <div className="form-section">
                <div className="form-row">
                  <div className="form-field full-width">
                    <label htmlFor="priority">Delivery Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={shipmentDetails.priority}
                      onChange={handleChange}
                      className="input-field select-field"
                    >
                      <option value="cost">Cost-effective</option>
                      <option value="speed">Fastest delivery</option>
                      <option value="balanced">Balanced</option>
                      <option value="eco">Eco-friendly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                Find Optimal Routes
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleClearForm}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      ) : showDetailedRoute ? (
        <div className="detailed-route-container">
          <h2>Detailed Route Information</h2>
          <div className="route-overview">
            <p className="route-summary">
              From <strong>{shipmentDetails.origin}</strong> to{" "}
              <strong>{shipmentDetails.destination}</strong>
            </p>
            <div style={{ width: "100%", height: "400px" }}>
              <Map />
            </div>
            <div className="overview-cards">
              <div className="overview-card">
                <span className="overview-icon cost-icon"></span>
                <div className="overview-details">
                  <span className="overview-label">Total Cost</span>
                  <span className="overview-value">
                    ${selectedRoute.cost.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="overview-card">
                <span className="overview-icon time-icon"></span>
                <div className="overview-details">
                  <span className="overview-label">Transit Time</span>
                  <span className="overview-value">
                    {selectedRoute.transitTime} days
                  </span>
                </div>
              </div>
              <div className="overview-card">
                <span className="overview-icon distance-icon"></span>
                <div className="overview-details">
                  <span className="overview-label">Total Distance</span>
                  <span className="overview-value">
                    {
                      calculateRouteStats(selectedRoute.detailedRoute)
                        .totalDistance
                    }{" "}
                    km
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="route-timeline">
            {selectedRoute.detailedRoute.map((segment, index) => (
              <div key={index} className="timeline-segment">
                <div
                  className={`timeline-point mode-${segment.mode.toLowerCase()}-point`}
                >
                  <div className="timeline-point-icon"></div>
                </div>
                <div className="timeline-line">
                  {index < selectedRoute.detailedRoute.length - 1 && (
                    <div
                      className={`timeline-mode-line mode-${segment.mode.toLowerCase()}-line`}
                    ></div>
                  )}
                </div>
                <div className="timeline-card">
                  <div className="timeline-header">
                    <h3
                      className={`timeline-title mode-${segment.mode.toLowerCase()}-text`}
                    >
                      {segment.mode} Transport
                    </h3>
                    <span className="timeline-subtitle">
                      {segment.from} → {segment.to}
                    </span>
                    {segment.borderCrossing && (
                      <span className="border-crossing-badge">
                        Border Crossing: {segment.borderCrossing}
                      </span>
                    )}
                  </div>
                  <div className="timeline-details">
                    <div className="detail-group">
                      <div className="detail-item">
                        <span className="detail-label">Provider:</span>
                        <span className="detail-value">{segment.company}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Vehicle:</span>
                        <span className="detail-value">{segment.vehicle}</span>
                      </div>
                    </div>
                    <div className="detail-group">
                      <div className="detail-item">
                        <span className="detail-label">Departure:</span>
                        <span className="detail-value">
                          {segment.departure}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Arrival:</span>
                        <span className="detail-value">{segment.arrival}</span>
                      </div>
                    </div>
                    <div className="detail-group">
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{segment.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Distance:</span>
                        <span className="detail-value">{segment.distance}</span>
                      </div>
                    </div>

                    {segment.mode === "Air" && segment.flightDetails && (
                      <div className="additional-details">
                        <h4>Flight Details</h4>
                        <div className="detail-item">
                          <span className="detail-label">Flight Number:</span>
                          <span className="detail-value">
                            {segment.flightDetails.flightNumber}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Aircraft:</span>
                          <span className="detail-value">
                            {segment.flightDetails.aircraft}
                          </span>
                        </div>
                      </div>
                    )}

                    {segment.mode === "Sea" && segment.vesselDetails && (
                      <div className="additional-details">
                        <h4>Vessel Details</h4>
                        <div className="detail-item">
                          <span className="detail-label">Capacity:</span>
                          <span className="detail-value">
                            {segment.vesselDetails.capacity}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Route:</span>
                          <span className="detail-value">
                            {segment.vesselDetails.route}
                          </span>
                        </div>
                      </div>
                    )}

                    {segment.mode === "Land" && segment.trainDetails && (
                      <div className="additional-details">
                        <h4>Train Details</h4>
                        <div className="detail-item">
                          <span className="detail-label">Train Number:</span>
                          <span className="detail-value">
                            {segment.trainDetails.trainNumber}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Carriage:</span>
                          <span className="detail-value">
                            {segment.trainDetails.carriageNumber}
                          </span>
                        </div>
                      </div>
                    )}
                    {segment.from_coords && (
  <div className="weather-section">
    <LocationWeather 
      coords={segment.from_coords}
      location={segment.from}
    />
  </div>
)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="detailed-route-actions">
            <button className="secondary-button" onClick={handleBack}>
              Back to Route Options
            </button>
            <button className="primary-button">Book This Route</button>
          </div>
        </div>
      ) : (
        <div className="results-container">
          <h2>Recommended Route Options</h2>
          <p className="route-summary">
            From <strong>{shipmentDetails.origin}</strong> to{" "}
            <strong>{shipmentDetails.destination}</strong>
          </p>

          <div className="route-filters">
            <button
              className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              <span className="filter-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                </svg>
              </span>
              All Routes
            </button>
            <button
              className={`filter-button ${activeFilter === "air" ? "active" : ""}`}
              onClick={() => handleFilterChange("air")}
            >
              <span className="filter-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
              </span>
              Air Only
            </button>
            <button
              className={`filter-button ${activeFilter === "sea" ? "active" : ""}`}
              onClick={() => handleFilterChange("sea")}
            >
              <span className="filter-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 17H6a3 3 0 0 1-3-3V4"></path>
                  <path d="M18 17v.01"></path>
                  <path d="M18 13v.01"></path>
                  <path d="M14 13v.01"></path>
                  <path d="M10 13v.01"></path>
                  <path d="M6 13v.01"></path>
                  <path d="M3 7v.01"></path>
                  <path d="M15 7h4.5L21 9h-4.5"></path>
                </svg>
              </span>
              Sea Only
            </button>
            <button
              className={`filter-button ${activeFilter === "land" ? "active" : ""}`}
              onClick={() => handleFilterChange("land")}
            >
              <span className="filter-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polyline points="16 8 20 8 23 11 23 16 16 16 16 8"></polyline>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              Land Only
            </button>
          </div>

          {/* Featured routes section (fastest and most cost-effective) */}
          {getFeaturedRoutes().length > 0 && (
            <div className="route-result-section">
              <h3 className="route-section-title">Recommended Options</h3>
              <div className="route-options">
                {getFeaturedRoutes().map((route) => (
                  <div
                    key={route.id}
                    className={`route-card featured featured-${route.category}`}
                  >
                    <div className="route-header">
                      <h3>
                        {route.category === "speed"
                          ? "Fastest Option"
                          : route.category === "cost"
                            ? "Most Cost-Effective"
                            : `Option ${route.id}`}
                      </h3>
                      <div className="route-modes">
                        {route.modes.map((mode, index) => (
                          <span
                            key={index}
                            className={`mode-tag mode-${mode.toLowerCase()}`}
                          >
                            {mode}
                            {index < route.modes.length - 1 && (
                              <span className="mode-arrow">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="route-details">
                      <div className="detail-item">
                        <span className="detail-label">Estimated Cost:</span>
                        <span className="detail-value">
                          ${route.cost.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Transit Time:</span>
                        <span className="detail-value">
                          {route.transitTime} days
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Border Crossings:</span>
                        <span className="detail-value">
                          {route.borderCrossings}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">CO2 Emissions:</span>
                        <span className="detail-value">
                          {route.co2Emissions}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reliability:</span>
                        <span className="detail-value">
                          {route.reliability}
                        </span>
                      </div>
                    </div>

                    <button
                      className="select-route-button"
                      onClick={() => handleSelectRoute(route)}
                    >
                      View Detailed Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other routes section */}
          {getRegularRoutes().length > 0 && (
            <div className="route-result-section">
              <h3 className="route-section-title">Alternative Options</h3>
              <div className="route-options">
                {getRegularRoutes().map((route) => (
                  <div key={route.id} className="route-card">
                    <div className="route-header">
                      <h3>Option {route.id}</h3>
                      <div className="route-modes">
                        {route.modes.map((mode, index) => (
                          <span
                            key={index}
                            className={`mode-tag mode-${mode.toLowerCase()}`}
                          >
                            {mode}
                            {index < route.modes.length - 1 && (
                              <span className="mode-arrow">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="route-details">
                      <div className="detail-item">
                        <span className="detail-label">Estimated Cost:</span>
                        <span className="detail-value">
                          ${route.cost.toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Transit Time:</span>
                        <span className="detail-value">
                          {route.transitTime} days
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Border Crossings:</span>
                        <span className="detail-value">
                          {route.borderCrossings}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">CO2 Emissions:</span>
                        <span className="detail-value">
                          {route.co2Emissions}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reliability:</span>
                        <span className="detail-value">
                          {route.reliability}
                        </span>
                      </div>
                    </div>

                    <button
                      className="select-route-button"
                      onClick={() => handleSelectRoute(route)}
                    >
                      View Detailed Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getFilteredRoutes().length === 0 && (
            <div className="no-results">
              <p>
                No routes found for the selected filter. Try a different option.
              </p>
            </div>
          )}

          <button className="back-button" onClick={handleBack}>
            Back to Form
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
