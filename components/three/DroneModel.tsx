"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, Group, Quaternion, Vector3 } from "three";

const ROTORS = Array.from({ length: 6 }, (_, index) => {
  const angle = index * Math.PI / 3 + Math.PI / 6;
  return { x: Math.cos(angle) * 1.65, z: Math.sin(angle) * 1.65, angle };
});
const NOZZLES = [-0.9, -0.3, 0.3, 0.9];

function Strut({ from, to, radius = 0.035, color = "#252c2d" }: { from: [number, number, number]; to: [number, number, number]; radius?: number; color?: string }) {
  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const direction = end.clone().sub(start);
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  return <mesh position={start.add(end).multiplyScalar(0.5)} quaternion={rotation} castShadow><cylinderGeometry args={[radius, radius, direction.length(), 12]} /><meshStandardMaterial color={color} metalness={0.65} roughness={0.4} /></mesh>;
}

function Rotor({ x, z, index, running }: { x: number; z: number; index: number; running: boolean }) {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (running && blades.current) blades.current.rotation.y += Math.min(delta, 0.05) * 43 * (index % 2 ? 1 : -1);
  });
  return <group position={[x, 0.15, z]}>
    <mesh castShadow><cylinderGeometry args={[0.095, 0.085, 0.18, 24]} /><meshStandardMaterial color="#343c3d" metalness={0.8} roughness={0.28} /></mesh>
    <mesh position={[0, 0.105, 0]}><cylinderGeometry args={[0.045, 0.065, 0.06, 20]} /><meshStandardMaterial color="#aaaead" metalness={0.9} roughness={0.25} /></mesh>
    <group ref={blades} position={[0, 0.13, 0]} rotation={[0, index * 0.7, 0]}>
      {[-1, 1].map(side => <mesh key={side} position={[side * 0.28, 0, 0]} rotation={[0, side * 0.08, side * 0.025]} castShadow><boxGeometry args={[0.55, 0.014, 0.075]} /><meshStandardMaterial color="#171e20" metalness={0.35} roughness={0.46} /></mesh>)}
    </group>
    {running && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}><circleGeometry args={[0.58, 48]} /><meshBasicMaterial color="#444d49" transparent opacity={0.055} depthWrite={false} /></mesh>}
    <mesh position={[0, -0.105, 0]}><sphereGeometry args={[0.025, 10, 10]} /><meshStandardMaterial color={index < 3 ? "#4fba6e" : "#d87b57"} emissive={index < 3 ? "#28753b" : "#8a3020"} emissiveIntensity={0.6} /></mesh>
  </group>;
}

function Spray({ running }: { running: boolean }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(4 * 90 * 3), 3));
    return g;
  }, []);
  const time = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!running) return;
    time.current += Math.min(delta, 0.05);
    const positions = geometry.attributes.position as BufferAttribute;
    for (let nozzle = 0; nozzle < 4; nozzle++) {
      for (let i = 0; i < 90; i++) {
        const index = nozzle * 90 + i;
        const phase = (i / 90 + time.current * 0.65) % 1;
        const angle = i * 2.39996;
        const width = 0.025 + phase * 0.3;
        positions.setXYZ(index, NOZZLES[nozzle] + Math.cos(angle) * width, -0.75 - phase * 1.3, Math.sin(angle) * width * 0.65 + 0.08);
      }
    }
    positions.needsUpdate = true;
  });
  return <points geometry={geometry} visible={running}><pointsMaterial color="#b9d9c6" size={0.025} transparent opacity={0.5} depthWrite={false} sizeAttenuation /></points>;
}

/** Detailed illustrative hexacopter; no external models or texture downloads. */
export function DroneModel({ running, spraying }: { running: boolean; spraying: boolean }) {
  const drone = useRef<Group>(null);
  const flightTime = useRef(0);
  useFrame((_, delta) => {
    if (!running || !drone.current) return;
    flightTime.current += Math.min(delta, 0.05);
    drone.current.position.y = 0.3 + Math.sin(flightTime.current * 1.4) * 0.055;
    drone.current.rotation.z = Math.sin(flightTime.current * 0.75) * 0.013;
    drone.current.rotation.x = Math.cos(flightTime.current * 0.85) * 0.013;
  });
  return <group ref={drone} position={[0, 0.3, 0]}>
    <RoundedBox args={[1.02, 0.16, 0.75]} radius={0.055} castShadow><meshStandardMaterial color="#292f30" metalness={0.55} roughness={0.38} /></RoundedBox>
    <RoundedBox args={[0.8, 0.22, 0.6]} position={[0, 0.15, 0]} radius={0.08} castShadow><meshStandardMaterial color="#e6e9df" roughness={0.32} metalness={0.08} /></RoundedBox>
    <RoundedBox args={[0.31, 0.12, 0.38]} position={[0, 0.3, -0.06]} radius={0.025} castShadow><meshStandardMaterial color="#344539" roughness={0.52} /></RoundedBox>
    {[-0.12, 0, 0.12].map(x => <mesh key={x} position={[x, 0.368, -0.06]}><boxGeometry args={[0.018, 0.006, 0.26]} /><meshStandardMaterial color="#1a2720" /></mesh>)}
    <mesh position={[0, 0.39, 0.21]}><cylinderGeometry args={[0.065, 0.055, 0.13, 20]} /><meshStandardMaterial color="#f0f1e8" roughness={0.35} /></mesh>
    <RoundedBox args={[0.72, 0.56, 0.62]} radius={0.12} position={[0, -0.34, 0]} castShadow><meshStandardMaterial color="#eeeedd" roughness={0.32} metalness={0.02} /></RoundedBox>
    <mesh position={[0.26, -0.26, 0]}><cylinderGeometry args={[0.065, 0.065, 0.25, 16]} /><meshStandardMaterial color="#78a283" roughness={0.4} /></mesh>
    {[-0.24, 0.24].map(x => <RoundedBox key={x} args={[0.035, 0.6, 0.65]} radius={0.01} position={[x, -0.32, 0]}><meshStandardMaterial color="#414848" metalness={0.4} roughness={0.5} /></RoundedBox>)}
    <mesh position={[0, -0.04, 0.43]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.08, 0.095, 0.1, 20]} /><meshStandardMaterial color="#292f31" metalness={0.6} roughness={0.28} /></mesh>
    <mesh position={[0, -0.04, 0.49]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 0.012, 24]} /><meshStandardMaterial color="#173649" metalness={0.95} roughness={0.12} /></mesh>
    {ROTORS.map(({ x, z }, index) => <group key={index}>
      <Strut from={[x * 0.19, 0, z * 0.19]} to={[x, 0.1, z]} radius={0.047} />
      <Strut from={[x * 0.28, -0.1, z * 0.28]} to={[x * 0.85, 0.08, z * 0.85]} radius={0.018} color="#59665b" />
      <Rotor x={x} z={z} index={index} running={running} />
    </group>)}
    {[-0.58, 0.58].map(x => <group key={x}>
      <Strut from={[x * 0.6, -0.07, -0.24]} to={[x, -0.98, -0.4]} radius={0.028} />
      <Strut from={[x * 0.6, -0.07, 0.24]} to={[x, -0.98, 0.4]} radius={0.028} />
      <Strut from={[x, -0.98, -0.64]} to={[x, -0.98, 0.64]} radius={0.04} />
    </group>)}
    <Strut from={[-1.04, -0.64, 0.08]} to={[1.04, -0.64, 0.08]} radius={0.024} />
    <Strut from={[0, -0.56, 0]} to={[0, -0.64, 0.08]} radius={0.025} color="#546851" />
    {NOZZLES.map(x => <group key={x} position={[x, -0.7, 0.08]}><mesh><cylinderGeometry args={[0.025, 0.04, 0.09, 12]} /><meshStandardMaterial color="#497c4c" roughness={0.4} /></mesh><mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.04, 0.035, 0.025, 14]} /><meshStandardMaterial color="#b2ac80" metalness={0.55} roughness={0.4} /></mesh></group>)}
    <Spray running={running && spraying} />
  </group>;
}
