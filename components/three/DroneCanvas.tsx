"use client";

import { Component, Suspense, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { DroneModel } from "./DroneModel";

export type DroneView = "perspective" | "front" | "top";
interface DroneCanvasProps { running: boolean; spraying: boolean; active: boolean; view: DroneView; onUnavailable?: () => void }

class ViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onUnavailable?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function CameraView({ view }: { view: DroneView }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const positions: Record<DroneView, [number, number, number]> = { perspective: [4.7, 3, 5.3], front: [0, 1.15, 7.3], top: [0, 7.6, 0.01] };
    camera.position.set(...positions[view]);
    camera.lookAt(0, -0.1, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [view, camera, invalidate]);
  return null;
}

export default function DroneCanvas({ running, spraying, active, view, onUnavailable }: DroneCanvasProps) {
  const fallback = <div className="absolute inset-0"><Image src="/assets/field-drone-editorial.webp" alt="Agricultural spraying drone above a paddy field" fill sizes="(max-width: 1024px) 92vw, 60vw" className="object-cover" /><p className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3 text-center text-xs text-muted">3D preview is unavailable on this device. Explore the drone features below.</p></div>;
  return <ViewerBoundary fallback={fallback} onUnavailable={onUnavailable}>
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={active && running ? "always" : "demand"}
      camera={{ position: [4.7, 3, 5.3], fov: 42, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      fallback={fallback}
      onCreated={({ gl }) => { gl.domElement.setAttribute("aria-label", "Interactive agricultural drone model; drag to rotate"); }}
    >
      <CameraView view={view} />
      <ambientLight intensity={1.25} />
      <hemisphereLight args={["#f8fbff", "#819a70", 1.5]} />
      <directionalLight position={[4, 7, 4]} intensity={3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0002} />
      <directionalLight position={[-4, 2, -3]} intensity={1.3} color="#fff3d9" />
      <Suspense fallback={null}>
        <DroneModel running={active && running} spraying={spraying} />
        <ContactShadows position={[0, -1.7, 0]} opacity={0.2} scale={10} blur={2.8} far={4} color="#28462b" frames={1} resolution={256} />
        <OrbitControls makeDefault target={[0, -0.1, 0]} enableZoom={false} enablePan={false} enableDamping={active && running} autoRotate={active && running} autoRotateSpeed={0.45} minPolarAngle={0.001} maxPolarAngle={Math.PI / 2.05} />
      </Suspense>
    </Canvas>
  </ViewerBoundary>;
}
