package models

import "time"

type FlightRoute struct {
	ID            int       `json:"id"`
	Departure     string    `json:"departure"`
	Arrival       string    `json:"arrival"`
	Airline       string    `json:"airline,omitempty"`
	FlightCode    string    `json:"flight_code,omitempty"`
	DepartureDate string    `json:"departure_date"`
	Transit       string    `json:"transit,omitempty"`
	Memo          string    `json:"memo,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateFlightRouteRequest struct {
	Departure     string `json:"departure" binding:"required"`
	Arrival       string `json:"arrival" binding:"required"`
	Airline       string `json:"airline"`
	FlightCode    string `json:"flight_code"`
	DepartureDate string `json:"departure_date" binding:"required"`
	Transit       string `json:"transit"`
	Memo          string `json:"memo"`
}

type PriceHistory struct {
	ID         int       `json:"id"`
	RouteID    int       `json:"route_id"`
	RecordDate string    `json:"record_date"`
	Price      int       `json:"price"`
	SourceSite string    `json:"source_site,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreatePriceHistoryRequest struct {
	RouteID    int    `json:"route_id" binding:"required"`
	RecordDate string `json:"record_date" binding:"required"`
	Price      int    `json:"price" binding:"required,min=0"`
	SourceSite string `json:"source_site"`
}

type RouteWithLatestPrice struct {
	FlightRoute
	LatestPrice      *int    `json:"latest_price,omitempty"`
	LatestRecordDate *string `json:"latest_record_date,omitempty"`
}
