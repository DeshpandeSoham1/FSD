import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const LOOP = 13.2;
const SPEED = 0.72;

function still() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Silver({ rough = 0.28 }) {
  return (
    <meshPhysicalMaterial
      color="#d7d4ce"
      metalness={0.94}
      roughness={rough}
      clearcoat={0.45}
      clearcoatRoughness={0.22}
    />
  );
}

function Red({ rough = 0.34 }) {
  return (
    <meshPhysicalMaterial
      color="#c80202"
      metalness={0.22}
      roughness={rough}
      clearcoat={1}
      clearcoatRoughness={0.16}
    />
  );
}

function Dark({ rough = 0.42 }) {
  return <meshPhysicalMaterial color="#161616" metalness={0.55} roughness={rough} />;
}

function Glass() {
  return (
    <meshPhysicalMaterial
      color="#9bb0c4"
      metalness={0.1}
      roughness={0.05}
      transmission={0.72}
      thickness={0.35}
      transparent
      opacity={0.9}
    />
  );
}

function CameraItem() {
  return (
    <group>
      <RoundedBox args={[1.22, 0.78, 0.48]} radius={0.1} smoothness={5}>
        <Silver />
      </RoundedBox>
      <RoundedBox args={[1.24, 0.16, 0.5]} radius={0.04} position={[0, 0.28, 0]}>
        <Red />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.28, 32]} />
        <Dark rough={0.22} />
      </mesh>
      <mesh position={[0, 0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 32]} />
        <Glass />
      </mesh>
      <mesh position={[0, 0.02, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.025, 12, 32]} />
        <Red rough={0.3} />
      </mesh>
      <RoundedBox args={[0.34, 0.16, 0.22]} radius={0.03} position={[0, 0.48, -0.02]}>
        <Silver rough={0.34} />
      </RoundedBox>
    </group>
  );
}

function GuitarItem() {
  return (
    <group rotation={[0.15, 0.25, -0.4]}>
      <mesh scale={[0.55, 0.72, 0.14]}>
        <sphereGeometry args={[1, 32, 24]} />
        <Red rough={0.32} />
      </mesh>
      <mesh position={[0, 0.12, 0.12]}>
        <circleGeometry args={[0.16, 24]} />
        <Dark />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.1, 1.35, 0.07]} />
        <Silver rough={0.36} />
      </mesh>
      <mesh position={[0, 1.92, 0]}>
        <boxGeometry args={[0.36, 0.16, 0.06]} />
        <Red />
      </mesh>
    </group>
  );
}

function PackItem() {
  return (
    <group>
      <RoundedBox args={[0.98, 1.2, 0.44]} radius={0.14} smoothness={5}>
        <Silver rough={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.32, 0.08]} radius={0.05} position={[0, 0.16, 0.25]}>
        <Red />
      </RoundedBox>
      <mesh position={[-0.4, 0.18, 0]}>
        <boxGeometry args={[0.07, 0.78, 0.07]} />
        <Dark />
      </mesh>
      <mesh position={[0.4, 0.18, 0]}>
        <boxGeometry args={[0.07, 0.78, 0.07]} />
        <Dark />
      </mesh>
      <RoundedBox args={[0.36, 0.16, 0.1]} radius={0.04} position={[0, 0.62, 0.2]}>
        <Dark />
      </RoundedBox>
    </group>
  );
}

function SpeakerItem() {
  return (
    <group>
      <RoundedBox args={[0.86, 1.18, 0.5]} radius={0.08} smoothness={4}>
        <Silver rough={0.32} />
      </RoundedBox>
      <mesh position={[0, 0.22, 0.27]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 32]} />
        <Red />
      </mesh>
      <mesh position={[0, 0.22, 0.31]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
        <Dark />
      </mesh>
      <mesh position={[0, -0.3, 0.27]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 24]} />
        <Silver rough={0.2} />
      </mesh>
    </group>
  );
}

function TentItem() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.48, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.74, 1.1, 4]} />
        <Red rough={0.48} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 8, 24]} />
        <Silver />
      </mesh>
      <mesh position={[0, 0.22, 0.46]}>
        <planeGeometry args={[0.26, 0.4]} />
        <Dark />
      </mesh>
    </group>
  );
}

function BikeItem() {
  return (
    <group rotation={[0.08, 0.5, 0]}>
      <mesh position={[-0.5, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 28]} />
        <Silver />
      </mesh>
      <mesh position={[0.5, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 28]} />
        <Silver />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1.05, 10]} />
        <Red />
      </mesh>
      <mesh position={[0.18, 0.32, 0]} rotation={[0, 0, -0.75]}>
        <cylinderGeometry args={[0.028, 0.028, 0.62, 10]} />
        <Silver />
      </mesh>
      <mesh position={[0.02, 0.08, 0]}>
        <boxGeometry args={[0.16, 0.06, 0.08]} />
        <Red />
      </mesh>
    </group>
  );
}

const KINDS = {
  camera: CameraItem,
  guitar: GuitarItem,
  pack: PackItem,
  speaker: SpeakerItem,
  tent: TentItem,
  bike: BikeItem,
};

const PIECES = [
  { kind: "camera", x: -0.15, y: -5.5, spin: 0.32, scale: 1.05 },
  { kind: "guitar", x: 0.35, y: -3.3, spin: -0.26, scale: 0.92 },
  { kind: "pack", x: -0.25, y: -1.1, spin: 0.22, scale: 1 },
  { kind: "speaker", x: 0.2, y: 1.1, spin: -0.2, scale: 0.98 },
  { kind: "tent", x: -0.1, y: 3.3, spin: 0.18, scale: 1.05 },
  { kind: "bike", x: 0.25, y: 5.5, spin: 0.28, scale: 1 },
];

function Rise({ x, y, spin, scale, children }) {
  const ref = useRef(null);
  const frozen = useMemo(still, []);
  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    if (!frozen) {
      group.position.y += delta * SPEED;
      if (group.position.y > LOOP / 2) group.position.y -= LOOP;
      group.rotation.y += delta * spin;
      group.position.x = x + Math.sin(state.clock.elapsedTime * 0.6 + y) * 0.08 + state.pointer.x * 0.18;
    }
  });
  return (
    <group ref={ref} position={[x, y, 0]} scale={scale}>
      {children}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.4, 4.6, 5.2]} intensity={3.2} color="#fff8f3" />
      <directionalLight position={[-3.6, 0.8, 3]} intensity={1.4} color="#9eb4c8" />
      <directionalLight position={[0, -2, 2]} intensity={0.6} color="#c80202" />
      <pointLight position={[1.4, 0.2, 2.4]} intensity={8} color="#ffd0c8" distance={10} />
    </>
  );
}

function Stage() {
  return (
    <>
      <Lights />
      {PIECES.map((piece) => {
        const Node = KINDS[piece.kind];
        return (
          <Rise key={piece.kind} x={piece.x} y={piece.y} spin={piece.spin} scale={piece.scale}>
            <Node />
          </Rise>
        );
      })}
    </>
  );
}

function FeatureRig() {
  const ref = useRef(null);
  const frozen = useMemo(still, []);
  const order = useMemo(() => ["camera", "speaker", "guitar", "bike", "pack", "tent"], []);
  useFrame((state) => {
    const group = ref.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    const index = frozen ? 0 : Math.floor(t / 3.4) % order.length;
    group.children.forEach((child, i) => {
      child.visible = i === index;
    });
    if (!frozen) {
      group.rotation.y = t * 0.35;
      group.position.y = Math.sin(t * 0.9) * 0.12;
      group.rotation.x = 0.12 + state.pointer.y * 0.08;
    }
  });
  return (
    <group ref={ref} position={[0, -0.05, 0]}>
      {order.map((kind) => {
        const Node = KINDS[kind];
        return (
          <group key={kind} scale={1.35}>
            <Node />
          </group>
        );
      })}
    </group>
  );
}

function canvasProps(cameraZ) {
  return {
    camera: { position: [0.15, 0, cameraZ], fov: 32 },
    dpr: [1, 1.7],
    gl: {
      alpha: true,
      antialias: true,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.25,
    },
  };
}

export default function RisingItems() {
  return (
    <div className="rise" aria-hidden="true">
      <Canvas
        {...canvasProps(5.6)}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Stage />
      </Canvas>
    </div>
  );
}

export function FeatureItem() {
  return (
    <div className="feature-rise" aria-hidden="true">
      <Canvas
        {...canvasProps(5.4)}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Lights />
        <FeatureRig />
      </Canvas>
    </div>
  );
}
