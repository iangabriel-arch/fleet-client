import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 120 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#C8A96E" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function FloatingRing({ position, rotation, color = '#C8A96E', speed = 0.3 }) {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * speed * 0.5;
      mesh.current.rotation.z += delta * speed;
    }
  });
  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <torusGeometry args={[1, 0.008, 16, 80]} />
      <meshStandardMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

function FloatingOrb() {
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere args={[1.2, 64, 64]} position={[3.5, 0, -3]}>
        <MeshDistortMaterial
          color="#0A1628"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.9}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

function FloatingCube({ position }) {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.2;
      mesh.current.rotation.y += delta * 0.3;
    }
  });
  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#C8A96E" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function LoginScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#050816']} />

      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]}   intensity={1.5} color="#C8A96E" />
      <pointLight position={[-5, -5, -3]} intensity={0.8} color="#4DA8FF" />
      <pointLight position={[0, 10, -5]}  intensity={0.5} color="#ffffff" />

      <Stars radius={80} depth={50} count={1500} factor={2} fade speed={0.5} />
      <Particles count={150} />

      <FloatingOrb />
      <FloatingRing position={[0, 0, -4]}    rotation={[Math.PI / 4, 0, 0]}        color="#C8A96E" speed={0.2} />
      <FloatingRing position={[-3, 1, -2]}   rotation={[Math.PI / 3, Math.PI / 6, 0]} color="#4DA8FF" speed={0.15} />
      <FloatingRing position={[4, -1, -3]}   rotation={[0, Math.PI / 4, Math.PI / 3]} color="#C8A96E" speed={0.25} />

      <FloatingCube position={[-4, 2,  -2]} />
      <FloatingCube position={[4,  -2, -1]} />
      <FloatingCube position={[-2, -3, -3]} />
      <FloatingCube position={[5,  2,  -4]} />

      <fog attach="fog" args={['#050816', 8, 25]} />
    </Canvas>
  );
}
