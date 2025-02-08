// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"dummy-data-server/models"

	"github.com/gorilla/websocket"
)

// upgrader is used to upgrade HTTP connections to websockets.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for testing purposes.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// wsHandler upgrades the HTTP connection to a websocket and periodically sends dummy NodeInfo JSON.
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	// Send a new dummy NodeInfo every second.
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case t := <-ticker.C:
			nodeInfo := generateDummyNodeInfo()
			// Update the timestamp field to the current time.
			nodeInfo.Position.Time = int32(t.Unix())
			data, err := json.Marshal(nodeInfo)
			if err != nil {
				log.Println("JSON marshal error:", err)
				return
			}
			if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println("Write message error:", err)
				return
			}
		}
	}
}

func main() {
	// Seed the random number generator.
	rand.Seed(time.Now().UnixNano())

	// Route for websocket connection.
	http.HandleFunc("/ws", wsHandler)

	// Serve static files (including index.html) from the "./static" directory.
	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

// generateDummyNodeInfo creates a dummy NodeInfo structure with random data.
func generateDummyNodeInfo() models.NodeInfo {
	num := uint32(rand.Intn(1000))
	user := models.User{
		Id:         fmt.Sprintf("user_%d", num),
		LongName:   "Long Name Example",
		ShortName:  "LN",
		HwModel:    models.TBEAM,
		IsLicensed: rand.Intn(2) == 0,
		Role:       models.CLIENT,
		PublicKey:  []byte("dummy_public_key"),
	}
	lat := int32(123456789) // dummy latitude value (in scaled integer form)
	lon := int32(987654321) // dummy longitude value
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

// Helper functions to return pointers for optional fields.
func ptrUint32(v uint32) *uint32    { return &v }
func ptrFloat32(v float32) *float32 { return &v }
