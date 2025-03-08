import React from "react";
import { fetchWeatherApi } from "openmeteo";
import { useState, useEffect } from "react";

// Define the weather data type
type WeatherData = {
  current: {
    temperature2m: number;
    rain: number;
    showers: number;
    snowfall: number;
  };
};

// Create a function component that fetches weather based on coordinates
const Weather = async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<WeatherData | null> => {
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: ["temperature_2m", "rain", "showers", "snowfall"],
    timezone: "auto",
    forecast_days: 16,
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

const useWeather = (latitude: number, longitude: number) => {
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
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude]);

  return { weatherData, loading, error };
};

type LocationWeatherProps = {
  coords: number[];
  location: string;
};

export default function LocationWeather({
  coords,
  location,
}: LocationWeatherProps) {
  const { weatherData, loading, error } = useWeather(coords[0], coords[1]);

  if (!coords) return null;

  return (
    <div className="location-weather">
      <h4 className="weather-location-title">
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
            <span className="weather-data-value">
              {weatherData.current.temperature2m}°C
            </span>
          </div>

          <div className="weather-data-item">
            <span className="weather-data-label">Rain</span>
            <span className="weather-data-value">
              {weatherData.current.rain} mm
            </span>
          </div>
          <div className="weather-data-item">
            <span className="weather-data-label">Snowfall</span>
            <span className="weather-data-value">
              {weatherData.current.snowfall} mm
            </span>
          </div>
          <div className="weather-data-item">
            <span className="weather-data-label">Showers</span>
            <span className="weather-data-value">
              {weatherData.current.showers} mm
            </span>
          </div>


        </div>
      ) : (
        <div className="weather-error">No weather data available</div>
      )}
    </div>
  );
}
