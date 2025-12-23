require("dotenv").config();
const http = require("http");
const mqtt = require("mqtt");
const { Server } = require("socket.io");

const PORT = 3000;
const SERIAL_ID = process.env.FLYTBASE_DEVICE_ID || "UNKNOWN_ID";

console.log("🔧 Starting server...");
console.log("   PORT:", PORT);
console.log("   Device ID (SERIAL_ID):", SERIAL_ID);

if (!process.env.FLYTBASE_MQTT_URL) {
  console.error("❌ FLYTBASE_MQTT_URL is missing in .env!");
}
if (!process.env.FLYTBASE_MQTT_USERNAME || !process.env.FLYTBASE_MQTT_PASSWORD) {
  console.warn("⚠️ MQTT credentials missing or incomplete");
}

const MQTT_URL = process.env.FLYTBASE_MQTT_URL;
const MQTT_USERNAME = process.env.FLYTBASE_MQTT_USERNAME;
const MQTT_PASSWORD = process.env.FLYTBASE_MQTT_PASSWORD;

const server = http.createServer();
const io = new Server(server, {
  path: "/socket/socket.io",
  cors: { origin: "*" },
});

const subscriptions = new Map(); 

io.on("connection", (socket) => {
  console.log(" Client connected:", socket.id);
  subscriptions.set(socket.id, new Set());

  socket.on("Subscribe", ({ topic }, ack) => {
    console.log(" Subscribe request from", socket.id, "→", topic);
    subscriptions.get(socket.id).add(topic);
    if (ack) ack({ success: true, topic });
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "| Reason:", reason);
    subscriptions.delete(socket.id);
  });
});

function emit(topic, payload) {
  let sentCount = 0;
  for (const [socketId, topics] of subscriptions.entries()) {
    if (topics.has(topic)) {
      io.to(socketId).emit(topic, payload);
      sentCount++;
    }
  }
  if (sentCount > 0) {
    console.log(` EMIT → ${topic} | Sent to ${sentCount} client(s)`);
  }
}

const telemetry = {
  latitude: null,
  longitude: null,
  height: null,
  gps_number: null,
  quality: null,
  rtk_number: null,
  mode_code: null,
  capacity_percent: null,
  timestamp: null,
};

let mqttMessageCount = 0;

const mqttClient = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  protocol: "mqtts",
  connectTimeout: 10000,
});

mqttClient.on("connect", () => {
  console.log("MQTT connected successfully");
  const topic = `thing/product/${SERIAL_ID}/osd/#`;
  console.log("   Subscribing to:", topic);
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error("MQTT subscribe failed:", err.message);
    else console.log("MQTT subscribed");
  });
});

mqttClient.on("close", () => console.warn(" MQTT connection closed"));
mqttClient.on("offline", () => console.warn(" MQTT client offline"));
mqttClient.on("error", (err) => console.error("MQTT error:", err.message));

mqttClient.on("message", (_, message) => {
  mqttMessageCount++;
  console.log(`MQTT message received #${mqttMessageCount}`);

  let payload;
  try {
    payload = JSON.parse(message.toString());
  } catch (e) {
    console.warn("Invalid JSON in MQTT message");
    return;
  }

  const d = payload?.data;
  if (!d) {
    console.log("(no 'data' field)");
    return;
  }

  let updated = [];
  let shouldEmitPosition = false;
  let shouldEmitState = false;

  if (d.latitude !== undefined && d.longitude !== undefined) {
    telemetry.latitude = d.latitude;
    telemetry.longitude = d.longitude;
    shouldEmitPosition = true;
    updated.push("position");
  }
  if (d.height !== undefined) {
    telemetry.height = d.height;
    shouldEmitPosition = true;
    updated.push("height");
  }
  if (d.position_state) {
    if (d.position_state.gps_number !== undefined) {
      telemetry.gps_number = d.position_state.gps_number;
      shouldEmitPosition = true;
      updated.push("gps_sat");
    }
    if (d.position_state.quality !== undefined) {
      telemetry.quality = d.position_state.quality;
      shouldEmitPosition = true;
      updated.push("rtk_quality");
    }
    if (d.position_state.rtk_number !== undefined) {
      telemetry.rtk_number = d.position_state.rtk_number;
      shouldEmitPosition = true;
      updated.push("rtk_sat");
    }
  }
  if (d.mode_code !== undefined) {
    telemetry.mode_code = d.mode_code;
    shouldEmitState = true;
    updated.push("mode/armed");
  }
  if (d.drone_charge_state?.capacity_percent !== undefined) {
    telemetry.capacity_percent = d.drone_charge_state.capacity_percent;
    shouldEmitState = true;
    updated.push("battery");
  }
  if (payload.timestamp) {
    telemetry.timestamp = payload.timestamp;
    shouldEmitPosition = true;
    shouldEmitState = true;
    updated.push("timestamp");
  }

  if (updated.length > 0) {
    console.log(`   Updated: ${updated.join(", ")}`);
  } else {
    console.log("   No recognized fields updated");
    return;
  }

  const cap = telemetry.capacity_percent ?? 85;

  if (shouldEmitPosition && telemetry.latitude !== null && telemetry.longitude !== null) {
    emit(`${SERIAL_ID}/global_position`, {
      position: {
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        altitude: telemetry.height ?? 0,
        gps_satellites: telemetry.gps_number ?? null,
      },
      rtk: {
        quality: telemetry.quality ?? null,
        rtk_satellites: telemetry.rtk_number ?? null,
      },
    });
  }

  if (shouldEmitState) {
    emit(`${SERIAL_ID}/drone_state`, {
      armed: telemetry.mode_code === 4,
      low_battery: cap < 30,
      critical_low_battery: cap < 15,
      activation_time: telemetry.timestamp ?? Date.now(),
    });
  }
});

let loopCount = 0;
setInterval(() => {
  loopCount++;
  console.log(`Telemetry loop #${loopCount}`);

  if (telemetry.latitude === null || telemetry.longitude === null) {
    console.log("   ⏳ No GPS fix yet → skipping emit");
    return;
  }

  console.log("Valid position → emitting (fallback loop)");

  const cap = telemetry.capacity_percent ?? 85;

  emit(`${SERIAL_ID}/global_position`, {
    position: {
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.height ?? 0,
      gps_satellites: telemetry.gps_number ?? null,
    },
    rtk: {
      quality: telemetry.quality ?? null,
      rtk_satellites: telemetry.rtk_number ?? null,
    },
  });

  emit(`${SERIAL_ID}/drone_state`, {
    armed: telemetry.mode_code === 4,
    low_battery: cap < 30,
    critical_low_battery: cap < 15,
    activation_time: telemetry.timestamp ?? Date.now(),
  });
}, 2000);

server.listen(PORT, () => {
  console.log(` Socket.IO server running on port ${PORT}`);
  console.log(`   Connect from frontend to: http://localhost:${PORT}/socket`);
});