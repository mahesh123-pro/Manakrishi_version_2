"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import type { Group } from "three";

const ARM = 1.15;
const armPositions: [number, number][] = [
  [ARM, ARM],
  [-ARM, ARM],
  [ARM, -ARM],
  [-ARM, -ARM],
];

function Propeller({ x, z, dir }: { x: number; z: number; dir: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 26 * dir;
  });
  return (
    <group position={[x, 0.28, z]}>
      {/* motor */}
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.3, 20]} />
        <meshStandardMaterial color="#12201a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* spinning blades */}
      <group ref={ref} position={[0, 0.2, 0]}>
        {[0, 1].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} castShadow>
            <boxGeometry args={[1.3, 0.02, 0.14]} />
            <meshStandardMaterial
              color="#0a0f0c"
              metalness={0.4}
              roughness={0.5}
              transparent
              opacity={0.55}
            />
          </mesh>
        ))}
      </group>
      {/* LED */}
      <mesh position={[0, -0.18, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#4ade80"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function DroneModel() {
  const drone = useRef<Group>(null);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow />
      <pointLight position={[-6, 2, -4]} intensity={40} color="#00bcd4" />
      <pointLight position={[6, -1, 4]} intensity={30} color="#4ade80" />

      <Float speed={2} rotationIntensity={0.35} floatIntensity={0.7}>
        <group ref={drone} scale={1.1} rotation={[0.2, 0.5, 0]}>
          {/* central body */}
          <RoundedBox args={[1.5, 0.4, 1.5]} radius={0.14} smoothness={4} castShadow>
            <meshStandardMaterial color="#16231c" metalness={0.6} roughness={0.35} />
          </RoundedBox>
          {/* top ridge */}
          <RoundedBox args={[0.9, 0.22, 0.9]} radius={0.1} position={[0, 0.28, 0]} castShadow>
            <meshStandardMaterial color="#2d5a27" metalness={0.5} roughness={0.4} />
          </RoundedBox>
          {/* camera / sensor pod */}
          <mesh position={[0, -0.28, 0.45]} rotation={[0.5, 0, 0]}>
            <sphereGeometry args={[0.2, 20, 20]} />
            <meshStandardMaterial color="#05080a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* spray tank */}
          <mesh position={[0, -0.42, -0.1]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 24]} />
            <meshStandardMaterial color="#0f1a14" metalness={0.4} roughness={0.5} transparent opacity={0.85} />
          </mesh>
          {/* spray nozzles */}
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, -0.55, 0]}>
              <coneGeometry args={[0.08, 0.16, 12]} />
              <meshStandardMaterial color="#ffb300" emissive="#ffb300" emissiveIntensity={0.6} />
            </mesh>
          ))}

          {/* arms + propellers */}
          {armPositions.map(([x, z], i) => (
            <group key={i}>
              <mesh position={[x / 2, 0.05, z / 2]} rotation={[0, Math.atan2(z, x), 0]} castShadow>
                <boxGeometry args={[ARM * 1.1, 0.12, 0.16]} />
                <meshStandardMaterial color="#12201a" metalness={0.6} roughness={0.4} />
              </mesh>
              <Propeller x={x} z={z} dir={i % 2 === 0 ? 1 : -1} />
            </group>
          ))}
        </group>
      </Float>
    </>
  );
}
