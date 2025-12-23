import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const DroneContext = createContext(null);

export const DroneProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [drone, setDrone] = useState({
    connected: true,
    calibration_status: null,
    rtk:null,
    gps: null,
    position: {
      lat: null,
      lon: null,
      alt: null,
    },
    state: {
    armed: null,
    lowBattery: null,
    criticalLowBattery: null,
    activationTime: null,
  },
  });

  useEffect(() => {
    const authToken = import.meta.env.VITE_FLYTBASE_TOKEN;
    const orgId = import.meta.env.VITE_FLYTBASE_ORG_ID;
    const droneId = import.meta.env.VITE_FLYTBASE_DEVICE_ID;

    if (!authToken || !orgId || !droneId) {
      console.error(" Missing FlytBase environment variables");
      return;
    }

    // 1. Initialize Socket Connection
    const socket = io("http://localhost:3000", {
      path: "/socket/socket.io",
      transports: ["websocket"],
      reconnection: true,
      auth: {
        authorization: `Bearer ${authToken}`,
        "org-id": orgId,
      },
    });

    socketRef.current = socket;

    // Define the dynamic topic names
    const TOPIC_STATE = `${droneId}/drone_state`;
    const TOPIC_POSITION = `${droneId}/global_position`;
    const T = `${droneId}/heartbeat`;

    socket.on("connect", () => {
      console.log(" SOCKET CONNECTED:", socket.id);
      setDrone((prev) => ({
    ...prev,
    connected: true,
  }));
        socket.emit ("Subscribe", { topic: `${droneId}/global_position` }, (response) => {
        console.log("Server acknowledged subscription:", response);
        });     
        socket.emit("Subscribe", { topic: TOPIC_STATE });
        console.log(`Subscribed to: ${TOPIC_STATE} and ${TOPIC_POSITION}`);
        console.log("Is socket actually connected?", socket.connected);
    });

    socket.on(TOPIC_POSITION, (data) => {
      console.log("Telemetry Data:", data);
      if (!data) return;

      setDrone((prev) => ({
        ...prev,
        position: {
          lat: data.position.latitude,
          lon: data.position.longitude,
          alt: data.position.altitude ?? 0,
        },
        elevation: data.position.elevation,
        gps: data.position.gps_satellites,
        quality: data.rtk.quality,
        rtk: data.rtk.rtk_satellites,
      }));
    });

socket.on(TOPIC_STATE, (data) => {
  console.log("🚁 State Data:", data);
  setDrone((prev) => ({
    ...prev,
        state: {
      armed: data.armed,
      lowBattery: data.low_battery,
      criticalLowBattery: data.critical_low_battery,
      activationTime: data.activation_time,
    },
  }));
});


    socket.on("connect_error", (err) => {
      console.error(" SOCKET CONNECT ERROR:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("SOCKET DISCONNECTED:", reason);
      setDrone((d) => ({ ...d, connected: false }));
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("🧹 Closing FlytBase socket");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <DroneContext.Provider value={{ drone }}>
      {children}
    </DroneContext.Provider>
  );
};

export const useDrone = () => {
  const ctx = useContext(DroneContext);
  if (!ctx) throw new Error("useDrone must be used inside DroneProvider");
  return ctx;
};