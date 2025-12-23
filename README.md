# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Running the Application
The project has two phases: local development (Phase 2) and cloud-connected demo (Phase 1).
Phase 2: Local Development (Backend + Frontend)

Start the backend server (handles MQTT → Socket.IO bridging):Bashcd backend
node index.cjs  # or index.js if renamed
In a separate terminal, start the frontend:Bashnpm run dev

This mode uses the local Socket.IO server at http://localhost:3000 for real-time telemetry.

Phase 1: Cloud Demo Mode (Direct FlytBase Connection)
To connect directly to FlytBase staging for a quick demo (bypassing local backend):

Edit context/DroneContext.jsx and update the socket URL:JavaScriptconst socket = io("wss://api-stag.flytbase.com", { ... });
In your global .env file (or .env.local), set the demo device ID:envVITE_FLYTBASE_DEVICE_ID=67c57340d4f4b385819aa2c4
Restart the frontend:Bashnpm run dev

This will display simulated/live demo telemetry from FlytBase staging.