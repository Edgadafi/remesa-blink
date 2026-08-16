"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NOPAL = "#2d5016";
const CENOTE = "#4a7c59";
const TERRACOTTA = "#c45c3e";
const GOLD = "#e3b63a";
const GOLD_SOL = "#f4cc55";
const PAPEL = "#f5f0e8";

type SceneProps = {
  animate: boolean;
};

function makeRail(offsetY: number, radius: number) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.2, -1.1 + offsetY, -2.4),
    new THREE.Vector3(-4.4, 0.55 + offsetY, 0.4),
    new THREE.Vector3(-0.6, -0.35 + offsetY, -1.1),
    new THREE.Vector3(3.6, 1.05 + offsetY, 0.2),
    new THREE.Vector3(8.4, -0.7 + offsetY, -2.0),
  ]);
  return new THREE.TubeGeometry(curve, 48, radius, 8, false);
}

function GoldCorridor({ animate }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const main = useMemo(() => makeRail(0, 0.09), []);
  const accent = useMemo(() => makeRail(-0.22, 0.035), []);

  useFrame((_, dt) => {
    if (!animate || !group.current) return;
    group.current.rotation.y += dt * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.15, -0.4]}>
      <mesh geometry={main}>
        <meshStandardMaterial
          color={GOLD}
          metalness={1}
          roughness={0.12}
          emissive={GOLD_SOL}
          emissiveIntensity={0.55}
        />
      </mesh>
      <mesh geometry={accent}>
        <meshStandardMaterial
          color={GOLD_SOL}
          metalness={1}
          roughness={0.16}
          emissive={GOLD}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

function RemesaCoins({ count = 8, animate }: { count?: number; animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return {
          x: side * (3.4 + (i % 4) * 0.55),
          y: -0.9 + (i % 5) * 0.42,
          z: -1.6 - (i % 3) * 0.45,
          s: 0.28 + (i % 3) * 0.06,
          spin: 0.55 + (i % 4) * 0.12,
          phase: i * 0.37,
        };
      }),
    [count]
  );

  useFrame((state) => {
    const inst = mesh.current;
    if (!inst) return;
    const t = animate ? state.clock.elapsedTime : 0;
    seeds.forEach((c, i) => {
      dummy.position.set(
        c.x + Math.sin(t * 0.4 + c.phase) * 0.12,
        c.y + Math.cos(t * 0.32 + c.phase) * 0.1,
        c.z
      );
      dummy.rotation.set(Math.PI / 2.2, t * c.spin, 0.2 + c.phase);
      dummy.scale.setScalar(c.s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[1, 1, 0.12, 16]} />
      <meshStandardMaterial
        color={GOLD}
        metalness={1}
        roughness={0.14}
        emissive={GOLD_SOL}
        emissiveIntensity={0.4}
      />
    </instancedMesh>
  );
}

function NopalCore({ animate }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!animate || !mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.1;
    mesh.current.rotation.y = t * 0.14;
  });

  return (
    <mesh ref={mesh} position={[4.4, 0.85, -1.8]} scale={0.72}>
      <icosahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color={NOPAL}
        roughness={0.28}
        metalness={0.35}
        emissive={CENOTE}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function TerracottaBeacon() {
  return (
    <mesh position={[-4.6, 1.35, -1.6]}>
      <octahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial
        color={TERRACOTTA}
        metalness={0.55}
        roughness={0.22}
        emissive={TERRACOTTA}
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function SceneContent({ animate }: SceneProps) {
  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime * 0.1;
    state.camera.position.x = Math.sin(t) * 0.22;
    state.camera.position.y = 0.35 + Math.cos(t * 0.65) * 0.08;
    state.camera.lookAt(0, 0.05, -0.6);
  });

  return (
    <>
      <hemisphereLight args={[PAPEL, "#3d2a12", 0.55]} />
      <directionalLight position={[5, 7, 4]} intensity={1.8} color={GOLD_SOL} />
      <directionalLight position={[-4, 2, 3]} intensity={0.45} color={CENOTE} />
      <pointLight position={[0, 1.2, 2]} intensity={0.7} color={GOLD} />
      <GoldCorridor animate={animate} />
      <NopalCore animate={animate} />
      <TerracottaBeacon />
      <RemesaCoins animate={animate} />
    </>
  );
}

export function CorridorScene({ animate }: SceneProps) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.25]}
      camera={{ position: [0, 0.4, 7.2], fov: 38, near: 0.1, far: 28 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      frameloop={animate ? "always" : "demand"}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContent animate={animate} />
    </Canvas>
  );
}
