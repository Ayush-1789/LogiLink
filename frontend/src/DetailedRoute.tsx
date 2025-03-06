import { FlightDetails } from "./FlightDetails";
import { Mode } from "./Mode";
import { TrainDetails } from "./TrainDetails";
import { VesselDetails } from "./VesselDetails";

export type DetailedRoute = {
  from: string;
  to: string;
  mode: Mode;
  vehicle: string;
  company: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: string;
  borderCrossing?: string;
  refrigerated?: boolean;
  temperature?: string;
  security?: string;
  fromCoords?: string;
  expedited?: boolean;
  trainDetails?: TrainDetails;
  flightDetails?: FlightDetails;
  vesselDetails?: VesselDetails;
};
