const BASE_URL = "http://localhost:8000";

enum Priority {
  COST = "cost",
  TIME = "time",
  ECO = "eco",
  BALANCED = "balanced",
}

enum GoodsType {
  STANDARD = "1",
  PERISHABLE = "2",
  HAZARDOUS = "3",
  FRAGILE = "4",
  OVERSIZE = "5",
  HIGH_VALUE = "6",
}

export type Segment = {
  start: string;
  end: string;
  mode: string;
  distance_km: number | string;
  time_hr: number;
  base_cost: number;
  goods_type_multiplier: number;
  adjusted_cost: number;
  goods_impact: number;
  customs_cost: number;
  total_segment_cost: number;
  geometry?: string;
  coordinates: [number, number][];
};

export type Data = {
  valid: boolean;
  total_cost: number;
  total_time: number;
  total_distance: number;
  total_emissions: number;
  goods_type: string;
  goods_type_score: number;
  segments: Segment[];
  modes: string[];
};

export type Route = {
  overview: string[];
  data: Data;
};

export async function getRoutes(
  source: string,
  destination: string,
  priority: Priority = Priority.BALANCED,
  goodsType: GoodsType = GoodsType.STANDARD,
  cargoWeight: number = 0.0,
) {
  const searchParams = new URLSearchParams();
  searchParams.append("priority", priority);
  searchParams.append("goodsType", goodsType);
  searchParams.append("cargoWeight", cargoWeight.toString());

  const url = `${BASE_URL}/routes/${source}/${destination}?${searchParams}`;

  const res = await fetch(url);
  const jsonData = await res.json();

  return jsonData as Route[];
}
