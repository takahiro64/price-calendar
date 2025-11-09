package routes

import (
	"database/sql"
	"price-calendar/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, db *sql.DB) {
	api := router.Group("/api")
	{
		// Flight routes endpoints
		api.GET("/routes", handlers.GetFlightRoutes(db))
		api.GET("/routes/:id", handlers.GetFlightRoute(db))
		api.POST("/routes", handlers.CreateFlightRoute(db))
		api.PUT("/routes/:id", handlers.UpdateFlightRoute(db))
		api.DELETE("/routes/:id", handlers.DeleteFlightRoute(db))

		// Price history endpoints
		api.GET("/routes/:id/prices", handlers.GetPriceHistory(db))
		api.POST("/prices", handlers.CreatePriceHistory(db))
		api.DELETE("/prices/:id", handlers.DeletePriceHistory(db))
	}
}
