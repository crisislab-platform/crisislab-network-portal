// models/models.go
package models

type Route struct {
	To   uint32 `json:"to"`
	From uint32 `json:"from"`
	RSSI uint32 `jsonn:"rssi"`
}

// NodeInfo represents the NodeInfo protobuf message.
type NodeInfo struct {
	Num           uint32        `json:"num"`
	User          User          `json:"user"`
	Position      Position      `json:"position"`
	SNR           float32       `json:"snr"`
	LastHeard     uint32        `json:"last_heard"`
	DeviceMetrics DeviceMetrics `json:"device_metrics"`
	Channel       uint32        `json:"channel"`
	ViaMqtt       bool          `json:"via_mqtt"`
	HopsAway      *uint32       `json:"hops_away,omitempty"`
	IsFavorite    bool          `json:"is_favorite"`
}

// User represents the User protobuf message.
type User struct {
	Id        string `json:"id"`
	LongName  string `json:"long_name"`
	ShortName string `json:"short_name"`
	// macaddr is deprecated, so it is omitted.
	HwModel    HardwareModel `json:"hw_model"`
	IsLicensed bool          `json:"is_licensed"`
	Role       Role          `json:"role"`
	PublicKey  []byte        `json:"public_key"`
}

// Position represents the Position protobuf message.
type Position struct {
	LatitudeI                 *int32    `json:"latitude_i,omitempty"`
	LongitudeI                *int32    `json:"longitude_i,omitempty"`
	Altitude                  int32     `json:"altitude"`
	Time                      int32     `json:"time"`
	LocationSource            LocSource `json:"location_source"`
	AltitudeSource            AltSource `json:"altitude_source"`
	Timestamp                 int32     `json:"timestamp"`
	TimestampMillisAdjust     int32     `json:"timestamp_millis_adjust"`
	AltitudeHae               *int32    `json:"altitude_hae,omitempty"`
	AltitudeGeoidalSeparation *int32    `json:"altitude_geoidal_separation,omitempty"`
	PDOP                      uint32    `json:"PDOP"`
	HDOP                      uint32    `json:"HDOP"`
	VDOP                      uint32    `json:"VDOP"`
	GPSAccuracy               uint32    `json:"gps_accuracy"`
	GroundSpeed               *uint32   `json:"ground_speed,omitempty"`
	GroundTrack               *uint32   `json:"ground_track,omitempty"`
	FixQuality                uint32    `json:"fix_quality"`
	FixType                   uint32    `json:"fix_type"`
	SatsInView                uint32    `json:"sats_in_view"`
	SensorId                  uint32    `json:"sensor_id"`
	NextUpdate                uint32    `json:"next_update"`
	SeqNumber                 uint32    `json:"seq_number"`
	PrecisionBits             uint32    `json:"precision_bits"`
}

// DeviceMetrics represents the DeviceMetrics protobuf message.
type DeviceMetrics struct {
	BatteryLevel       *uint32  `json:"battery_level,omitempty"`
	Voltage            *float32 `json:"voltage,omitempty"`
	ChannelUtilization *float32 `json:"channel_utilization,omitempty"`
	AirUtilTx          *float32 `json:"air_util_tx,omitempty"`
	UptimeSeconds      *uint32  `json:"uptime_seconds,omitempty"`
}

// HardwareModel is an enumeration of hardware models.
type HardwareModel int

const (
	UNSET HardwareModel = iota
	TLORA_V2
	TLORA_V1
	TLORA_V2_1_1P6
	TBEAM // For dummy data we use TBEAM.
	// … (other models could be defined here as needed)
)

// Role is an enumeration of user/device roles.
type Role int

const (
	CLIENT Role = iota
	CLIENT_MUTE
	ROUTER
	// Skipping deprecated ROUTER_CLIENT
	REPEATER
	TRACKER
	SENSOR
	TAK
	CLIENT_HIDDEN
	LOST_AND_FOUND
	TAK_TRACKER
)

// LocSource is an enumeration of location sources.
type LocSource int

const (
	LOC_UNSET LocSource = iota
	LOC_MANUAL
	LOC_INTERNAL
	LOC_EXTERNAL
)

// AltSource is an enumeration of altitude sources.
type AltSource int

const (
	ALT_UNSET AltSource = iota
	ALT_MANUAL
	ALT_INTERNAL
	ALT_EXTERNAL
	ALT_BAROMETRIC
)
