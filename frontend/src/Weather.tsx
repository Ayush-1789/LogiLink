import { fetchWeatherApi } from 'openmeteo';
import { useState, useEffect } from "react";
import App from './App';

// Define the weather data type
interface WeatherData {
  current: {
    temperature2m: number;
    rain: number;
    showers: number;
    snowfall: number;
  }
}

// Create a function component that fetches weather based on coordinates
const Weather = async ({ latitude, longitude }: { latitude: number, longitude: number }): Promise<WeatherData | null> => {
  const params = {
    "latitude": latitude,
    "longitude": longitude,
    "current": ["temperature_2m", "rain", "showers", "snowfall"],
    "timezone": "auto",
    "forecast_days": 16
  };
  
  const url = "https://api.open-meteo.com/v1/forecast"; // Changed to actual working API endpoint
  
  try {
    const responses = await fetchWeatherApi(url, params);
    
    // Process first location
    const response = responses[0];
    
    // Attributes for timezone and location
    
    const current = response.current()!;
    
    // Return the weather data
    return {
      current: {
        temperature2m: current.variables(0)!.value(),
        rain: current.variables(1)!.value(),
        showers: current.variables(2)!.value(),
        snowfall: current.variables(3)!.value(),
      },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

// Create a hook to use the weather data in React components
export const useWeather = (latitude: number, longitude: number) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await Weather({ latitude, longitude });
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude]);

  return { weatherData, loading, error };
};

export default Weather;