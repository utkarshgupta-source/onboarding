// debug.cjs
const http = require("http");
const { Server } = require("socket.io");

const PORT = 3000;

const server = http.createServer();

const io = new Server(server, {
  path: "/socket/socket.io",
  cors: {
    origin: "*",
  },
});

const subscriptions = new Map(); // socket.id -> Set(topics)

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  subscriptions.set(socket.id, new Set());

  socket.on("Subscribe", ({ topic }, ack) => {
    console.log("📡 Subscribe request:", topic);

    subscriptions.get(socket.id).add(topic);

    if (ack) {
      ack({ success: true, topic });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    subscriptions.delete(socket.id);
  });
});

/* ================= EMIT FAKE DATA ================= */

function emit(topic, payload) {
  for (const [socketId, topics] of subscriptions.entries()) {
    if (topics.has(topic)) {
      io.to(socketId).emit(topic, payload);
      console.log("📤 EMIT →", topic);
    }
  }
}

setInterval(() => {
  const DRONE_ID = "67c57340d4f4b385819aa2c4";

  emit(`${DRONE_ID}/global_position`, {
    position: {
      latitude: 18.5743 + Math.random() * 0.001,
      longitude: 73.7831 + Math.random() * 0.001,
      altitude: 120,
      gps_satellites: 14,
    },
    rtk: {
      quality: 5,
      rtk_satellites: 22,
    },
  });

  emit(`${DRONE_ID}/drone_state`, {
    armed: true,
    low_battery: false,
    critical_low_battery: false,
    activation_time: Date.now(),
  });
}, 2000);

/* ================= START ================= */
server.listen(PORT, () => {
  console.log(`🚀 Debug Socket.IO server running on ${PORT}`);
});
