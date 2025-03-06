import { Mode } from "./Mode";
import { DetailedRoute } from "./DetailedRoute";

export type Route = {
  id: number;
  modes: Mode[];
  cost: number;
  transitTime: number;
  co2Emissions: string;
  reliability: string;
  borderCrossings: number;
  category: string;
  specializedFor?: string;
  detailedRoute: DetailedRoute[];
};
