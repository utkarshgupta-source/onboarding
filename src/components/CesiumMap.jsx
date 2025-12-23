import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useDrone } from "../context/DroneContext";

const CesiumMap = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const droneEntityRef = useRef(null);

  const { drone } = useDrone();
  useEffect(() => {
    if (!containerRef.current) return;

    window.CESIUM_BASE_URL = "/cesium";

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
    });

    viewerRef.current = viewer;

    // Drone entity WITHOUT fallback position
    const droneEntity = viewer.entities.add({
      position: undefined, // IMPORTANT
      billboard: {
        image:
          "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6f0.png",
        width: 36,
        height: 36,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: "Drone",
        font: "14px sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -30),
        fillColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      },
    });

    droneEntityRef.current = droneEntity;

    // Initial zoomed-out global view
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 0, 20_000_000),
    });

    return () => viewer.destroy();
  }, []);


  useEffect(() => {
    if (!viewerRef.current || !droneEntityRef.current) return;

    const lat = Number(drone.position.lat);
    const lon = Number(drone.position.lon);
    const alt = Number(drone.position.alt) || 100;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    droneEntityRef.current.position = position;

  
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 3000),
      duration: 0.8,
    });
  }, [drone.position.lat, drone.position.lon, drone.position.alt]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        overflow: "hidden",
      }}
    />
  );
};

export default CesiumMap;
