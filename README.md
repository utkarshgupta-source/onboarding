## Running the Application
The project has two phases: local development (Phase 2) and cloud-connected demo (Phase 1).

## Phase 2: Local Development (Backend + Frontend)

Start the backend server (handles MQTT → Socket.IO bridging):Bashcd backend
node index.cjs  # or index.js if renamed
In a separate terminal, start the frontend:Bashnpm run dev

This mode uses the local Socket.IO server at http://localhost:3000 for real-time telemetry.

## Phase 1: Cloud Demo Mode (Direct FlytBase Connection)
To connect directly to FlytBase staging for a quick demo (bypassing local backend):

Edit context/DroneContext.jsx and update the socket URL:JavaScriptconst socket = io("wss://api-stag.flytbase.com", { ... });
In your global .env file (or .env.local), set the demo device ID:env VITE_FLYTBASE_DEVICE_ID=67c57340d4f4b385819aa2c4
Restart the frontend:Bashnpm run dev

This will display simulated/live demo telemetry from FlytBase staging.