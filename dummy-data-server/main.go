// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"dummy-data-server/models"

	"github.com/gorilla/websocket"
)

// --- Global Variables for Data Stores ---

var (
	// nodesStore holds the current NodeInfo objects, keyed by node number.
	nodesStore = make(map[uint32]models.NodeInfo)
	nodesMutex sync.RWMutex

	// routesStore holds the current Routes, keyed by a canonical "from-to" string.
	routesStore = make(map[string]models.Route)
	routesMutex sync.RWMutex
)

// --- Global Variables for WebSocket Clients ---

var (
	nodeClients   = make(map[*websocket.Conn]bool)
	nodeClientsMu sync.Mutex

	routeClients   = make(map[*websocket.Conn]bool)
	routeClientsMu sync.Mutex
)

// --- WebSocket Upgrader ---
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for testing purposes.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// --- Helper Functions to Broadcast Updates ---

func broadcastNodeUpdate(update []byte) {
	nodeClientsMu.Lock()
	defer nodeClientsMu.Unlock()
	for conn := range nodeClients {
		if err := conn.WriteMessage(websocket.TextMessage, update); err != nil {
			log.Println("Error writing node update:", err)
			conn.Close()
			delete(nodeClients, conn)
		}
	}
}

func broadcastRouteUpdate(update []byte) {
	routeClientsMu.Lock()
	defer routeClientsMu.Unlock()
	for conn := range routeClients {
		if err := conn.WriteMessage(websocket.TextMessage, update); err != nil {
			log.Println("Error writing route update:", err)
			conn.Close()
			delete(routeClients, conn)
		}
	}
}

// --- WebSocket Handlers ---

// wsHandlerNodes handles WebSocket connections for node updates.
func wsHandlerNodes(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error (nodes):", err)
		return
	}
	// Register connection
	nodeClientsMu.Lock()
	nodeClients[conn] = true
	nodeClientsMu.Unlock()

	defer func() {
		nodeClientsMu.Lock()
		delete(nodeClients, conn)
		nodeClientsMu.Unlock()
		conn.Close()
	}()
	// Keep the connection open
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

// wsHandlerRoutes handles WebSocket connections for route updates.
func wsHandlerRoutes(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error (routes):", err)
		return
	}
	routeClientsMu.Lock()
	routeClients[conn] = true
	routeClientsMu.Unlock()

	defer func() {
		routeClientsMu.Lock()
		delete(routeClients, conn)
		routeClientsMu.Unlock()
		conn.Close()
	}()
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

// --- HTTP Endpoints to Retrieve Entire Data Sets ---

// getNodesHandler returns a JSON array of all NodeInfo objects.
func getNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodesMutex.RLock()
	defer nodesMutex.RUnlock()
	var nodeList []models.NodeInfo
	for _, node := range nodesStore {
		nodeList = append(nodeList, node)
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(nodeList); err != nil {
		log.Println("Error encoding node list:", err)
	}
}

// getRoutesHandler returns a JSON array of all Routes.
func getRoutesHandler(w http.ResponseWriter, r *http.Request) {
	routesMutex.RLock()
	defer routesMutex.RUnlock()
	var routeList []models.Route
	for _, route := range routesStore {
		routeList = append(routeList, route)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(routeList)
}

// --- Timed Function to Update Data ---

func updateData() {
	// Run every 5 seconds (adjust as needed)
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		<-ticker.C

		// Generate or update a NodeInfo
		node := generateDummyNodeInfo()
		nodesMutex.Lock()
		nodesStore[node.Num] = node // update or create
		nodesMutex.Unlock()
		nodeJSON, err := json.Marshal(node)
		if err != nil {
			log.Println("Error marshalling node:", err)
		} else {
			broadcastNodeUpdate(nodeJSON)
		}
		if len(routesStore) <= 50 {
			// Generate or update a Route
			route := generateDummyRoute()
			// Create a canonical key that is order-independent.
			var key string
			if route.From < route.To {
				key = fmt.Sprintf("%d-%d", route.From, route.To)
			} else {
				key = fmt.Sprintf("%d-%d", route.To, route.From)
			}
			routesMutex.Lock()
			routesStore[key] = route
			routesMutex.Unlock()
			routeJSON, err := json.Marshal(route)
			if err != nil {
				log.Println("Error marshalling route:", err)
			} else {
				broadcastRouteUpdate(routeJSON)
			}
		}
	}
}

// --- Main Function ---

func main() {
	rand.Seed(time.Now().UnixNano())

	// Start the data update goroutine.
	go updateData()

	// WebSocket endpoints
	http.HandleFunc("/ws", wsHandlerNodes)
	http.HandleFunc("/wsr", wsHandlerRoutes)

	// HTTP endpoints to get full data
	http.HandleFunc("/get_nodes", getNodesHandler)
	http.HandleFunc("/get_routes", getRoutesHandler)

	// Serve static files from the "./static" directory
	// This will serve your webapp.
	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

// --- Dummy Data Generation Functions ---

func generateDummyNodeInfo() models.NodeInfo {
	num := uint32(rand.Intn(50))
	user := models.User{
		Id:         fmt.Sprintf("user_%d", num),
		LongName:   "Long Name Example",
		ShortName:  "LN",
		HwModel:    models.TBEAM,
		IsLicensed: rand.Intn(2) == 0,
		Role:       models.CLIENT,
		PublicKey:  []byte("dummy_public_key"),
	}
	lat := int32(rand.Float64()*180e7 - 90e7)
	lon := int32(rand.Float64()*360e7 - 180e7)
	position := models.Position{
		LatitudeI:             &lat,
		LongitudeI:            &lon,
		Altitude:              100,
		Time:                  int32(time.Now().Unix()),
		LocationSource:        models.LOC_INTERNAL,
		AltitudeSource:        models.ALT_INTERNAL,
		Timestamp:             int32(time.Now().Unix()),
		TimestampMillisAdjust: 0,
		FixQuality:            1,
		FixType:               3,
		SatsInView:            8,
		SensorId:              1,
		NextUpdate:            60,
		SeqNumber:             1,
		PrecisionBits:         10,
	}
	deviceMetrics := models.DeviceMetrics{
		BatteryLevel:       ptrUint32(uint32(rand.Intn(100))),
		Voltage:            ptrFloat32(3.7),
		ChannelUtilization: ptrFloat32(50.0),
		AirUtilTx:          ptrFloat32(30.0),
		UptimeSeconds:      ptrUint32(3600),
	}
	return models.NodeInfo{
		Num:           num,
		User:          user,
		Position:      position,
		SNR:           10.0,
		LastHeard:     uint32(time.Now().Unix()),
		DeviceMetrics: deviceMetrics,
		Channel:       1,
		ViaMqtt:       false,
		HopsAway:      nil,
		IsFavorite:    false,
	}
}

func generateDummyRoute() models.Route {
	return models.Route{
		From: uint32(rand.Intn(50)),
		To:   uint32(rand.Intn(50)),
		RSSI: uint32(rand.Intn(200)),
	}
}

func ptrUint32(v uint32) *uint32 {
	return &v
}

func ptrFloat32(v float32) *float32 {
	return &v
}
