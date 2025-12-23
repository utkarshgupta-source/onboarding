import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Drone } from "lucide-react";
import { useDrone } from "../context/DroneContext";

const TelemetryPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { drone } = useDrone();

  // ✅ FIX: use valid Tailwind colors
  const statusClasses = drone.connected
    ? "bg-green-600 hover:bg-green-700 focus:ring-green-400"
    : "bg-red-600 hover:bg-red-700 focus:ring-red-400";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Safe rounding
  const lat =
    typeof drone.position.lat === "number"
      ? drone.position.lat.toFixed(5)
      : "N/A";

  const lon =
    typeof drone.position.lon === "number"
      ? drone.position.lon.toFixed(5)
      : "N/A";

  return (
    <div className="relative bg-gray-50 max-w-xs w-full p-6 border border-gray-200 rounded-xl shadow-sm">
      {/* Dropdown */}
      <div className="absolute top-2 right-2" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg p-1.5"
        >
          <MoreHorizontal size={24} strokeWidth={3} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 z-10 bg-white border rounded-lg shadow-lg w-36 py-2">
            <ul className="text-sm text-gray-700 font-medium">
              <li className="px-4 py-2 hover:bg-gray-100">Edit</li>
              <li className="px-4 py-2 hover:bg-gray-100">Export Data</li>
              <li className="px-4 py-2 text-red-600 hover:bg-gray-100">
                Delete
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-6 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 text-blue-600">
          <Drone size={48} strokeWidth={1.5} />
        </div>

        <h5 className="mb-3 text-xl font-semibold text-gray-900">STATUS</h5>

        {/* ✅ STATUS BUTTON (NOW VISIBLE) */}
        <button
          type="button"
          className={`text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow focus:outline-none focus:ring-4 transition-colors ${statusClasses}`}
        >
          <div className="flex items-center gap-2">
            {drone.connected && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-white" />
              </span>
            )}
            {drone.connected ? "Online" : "Offline"}
          </div>
        </button>

        {/* Lat / Lon */}
        <div className="flex mt-6 gap-3">
          <div className="px-4 py-2 text-sm bg-white border rounded-lg">
            Latitude: {lat}
          </div>
          <div className="px-4 py-2 text-sm bg-white border rounded-lg">
            Longitude: {lon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
