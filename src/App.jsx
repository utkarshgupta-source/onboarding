import DashboardLayout from "./components/DashboardLayout";
import { DroneProvider } from "./context/DroneContext";

function App() {
  return (
    <DroneProvider>
      <DashboardLayout />
    </DroneProvider>
  );
}

export default App;
