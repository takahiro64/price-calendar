package handlers

import (
	"database/sql"
	"net/http"
	"price-calendar/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetFlightRoutes returns all flight routes with their latest price
func GetFlightRoutes(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `
			SELECT 
				r.id, r.departure, r.arrival, r.airline, r.flight_code,
				r.departure_date, r.transit, r.memo, r.created_at, r.updated_at,
				p.price as latest_price, p.record_date as latest_record_date
			FROM flight_route r
			LEFT JOIN LATERAL (
				SELECT price, record_date
				FROM price_history
				WHERE route_id = r.id
				ORDER BY record_date DESC
				LIMIT 1
			) p ON true
			ORDER BY r.departure_date DESC, r.created_at DESC
		`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch routes"})
			return
		}
		defer rows.Close()

		var routes []models.RouteWithLatestPrice
		for rows.Next() {
			var route models.RouteWithLatestPrice
			err := rows.Scan(
				&route.ID, &route.Departure, &route.Arrival, &route.Airline, &route.FlightCode,
				&route.DepartureDate, &route.Transit, &route.Memo, &route.CreatedAt, &route.UpdatedAt,
				&route.LatestPrice, &route.LatestRecordDate,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse routes"})
				return
			}
			routes = append(routes, route)
		}

		c.JSON(http.StatusOK, routes)
	}
}

// GetFlightRoute returns a single flight route by ID
func GetFlightRoute(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var route models.FlightRoute
		query := `
			SELECT id, departure, arrival, airline, flight_code, 
				   departure_date, transit, memo, created_at, updated_at
			FROM flight_route
			WHERE id = $1
		`

		err := db.QueryRow(query, id).Scan(
			&route.ID, &route.Departure, &route.Arrival, &route.Airline, &route.FlightCode,
			&route.DepartureDate, &route.Transit, &route.Memo, &route.CreatedAt, &route.UpdatedAt,
		)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route"})
			return
		}

		c.JSON(http.StatusOK, route)
	}
}

// CreateFlightRoute creates a new flight route
func CreateFlightRoute(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateFlightRouteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		query := `
			INSERT INTO flight_route 
				(departure, arrival, airline, flight_code, departure_date, transit, memo)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, created_at, updated_at
		`

		var route models.FlightRoute
		route.Departure = req.Departure
		route.Arrival = req.Arrival
		route.Airline = req.Airline
		route.FlightCode = req.FlightCode
		route.DepartureDate = req.DepartureDate
		route.Transit = req.Transit
		route.Memo = req.Memo

		err := db.QueryRow(
			query,
			req.Departure, req.Arrival, req.Airline, req.FlightCode,
			req.DepartureDate, req.Transit, req.Memo,
		).Scan(&route.ID, &route.CreatedAt, &route.UpdatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create route"})
			return
		}

		c.JSON(http.StatusCreated, route)
	}
}

// UpdateFlightRoute updates an existing flight route
func UpdateFlightRoute(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var req models.CreateFlightRouteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		query := `
			UPDATE flight_route
			SET departure = $1, arrival = $2, airline = $3, flight_code = $4,
				departure_date = $5, transit = $6, memo = $7
			WHERE id = $8
			RETURNING id, departure, arrival, airline, flight_code, 
					  departure_date, transit, memo, created_at, updated_at
		`

		var route models.FlightRoute
		err := db.QueryRow(
			query,
			req.Departure, req.Arrival, req.Airline, req.FlightCode,
			req.DepartureDate, req.Transit, req.Memo, id,
		).Scan(
			&route.ID, &route.Departure, &route.Arrival, &route.Airline, &route.FlightCode,
			&route.DepartureDate, &route.Transit, &route.Memo, &route.CreatedAt, &route.UpdatedAt,
		)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update route"})
			return
		}

		c.JSON(http.StatusOK, route)
	}
}

// DeleteFlightRoute deletes a flight route
func DeleteFlightRoute(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		result, err := db.Exec("DELETE FROM flight_route WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete route"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Route deleted successfully"})
	}
}

// GetPriceHistory returns price history for a specific route
func GetPriceHistory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		routeID := c.Param("id")

		query := `
			SELECT id, route_id, record_date, price, source_site, created_at
			FROM price_history
			WHERE route_id = $1
			ORDER BY record_date ASC
		`

		rows, err := db.Query(query, routeID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price history"})
			return
		}
		defer rows.Close()

		var prices []models.PriceHistory
		for rows.Next() {
			var price models.PriceHistory
			err := rows.Scan(
				&price.ID, &price.RouteID, &price.RecordDate,
				&price.Price, &price.SourceSite, &price.CreatedAt,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse price history"})
				return
			}
			prices = append(prices, price)
		}

		c.JSON(http.StatusOK, prices)
	}
}

// CreatePriceHistory creates a new price history record
func CreatePriceHistory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreatePriceHistoryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if price for this date already exists
		var existingID int
		checkQuery := `SELECT id FROM price_history WHERE route_id = $1 AND record_date = $2`
		err := db.QueryRow(checkQuery, req.RouteID, req.RecordDate).Scan(&existingID)

		if err == nil {
			// Update existing record
			updateQuery := `
				UPDATE price_history
				SET price = $1, source_site = $2
				WHERE id = $3
				RETURNING id, route_id, record_date, price, source_site, created_at
			`
			var price models.PriceHistory
			err = db.QueryRow(updateQuery, req.Price, req.SourceSite, existingID).Scan(
				&price.ID, &price.RouteID, &price.RecordDate,
				&price.Price, &price.SourceSite, &price.CreatedAt,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update price"})
				return
			}
			c.JSON(http.StatusOK, price)
			return
		}

		// Insert new record
		insertQuery := `
			INSERT INTO price_history (route_id, record_date, price, source_site)
			VALUES ($1, $2, $3, $4)
			RETURNING id, route_id, record_date, price, source_site, created_at
		`

		var price models.PriceHistory
		err = db.QueryRow(
			insertQuery,
			req.RouteID, req.RecordDate, req.Price, req.SourceSite,
		).Scan(
			&price.ID, &price.RouteID, &price.RecordDate,
			&price.Price, &price.SourceSite, &price.CreatedAt,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create price history"})
			return
		}

		c.JSON(http.StatusCreated, price)
	}
}

// DeletePriceHistory deletes a price history record
func DeletePriceHistory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price ID"})
			return
		}

		result, err := db.Exec("DELETE FROM price_history WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete price"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Price not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Price deleted successfully"})
	}
}
