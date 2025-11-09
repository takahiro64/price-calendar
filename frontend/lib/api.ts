const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface FlightRoute {
  id: number;
  departure: string;
  arrival: string;
  airline?: string;
  flight_code?: string;
  departure_date: string;
  transit?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
  latest_price?: number;
  latest_record_date?: string;
}

export interface CreateFlightRouteRequest {
  departure: string;
  arrival: string;
  airline?: string;
  flight_code?: string;
  departure_date: string;
  transit?: string;
  memo?: string;
}

export interface PriceHistory {
  id: number;
  route_id: number;
  record_date: string;
  price: number;
  source_site?: string;
  created_at: string;
}

export interface CreatePriceHistoryRequest {
  route_id: number;
  record_date: string;
  price: number;
  source_site?: string;
}

// Flight Routes API
export const getFlightRoutes = async (): Promise<FlightRoute[]> => {
  const response = await fetch(`${API_BASE_URL}/api/routes`);
  if (!response.ok) throw new Error('Failed to fetch routes');
  return response.json();
};

export const getFlightRoute = async (id: number): Promise<FlightRoute> => {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`);
  if (!response.ok) throw new Error('Failed to fetch route');
  return response.json();
};

export const createFlightRoute = async (
  data: CreateFlightRouteRequest
): Promise<FlightRoute> => {
  const response = await fetch(`${API_BASE_URL}/api/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create route');
  return response.json();
};

export const updateFlightRoute = async (
  id: number,
  data: CreateFlightRouteRequest
): Promise<FlightRoute> => {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update route');
  return response.json();
};

export const deleteFlightRoute = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete route');
};

// Price History API
export const getPriceHistory = async (routeId: number): Promise<PriceHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}/prices`);
  if (!response.ok) throw new Error('Failed to fetch price history');
  return response.json();
};

export const createPriceHistory = async (
  data: CreatePriceHistoryRequest
): Promise<PriceHistory> => {
  const response = await fetch(`${API_BASE_URL}/api/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create price history');
  return response.json();
};

export const deletePriceHistory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/prices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete price history');
};
