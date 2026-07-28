import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { AI_BRAND_NAME } from '../../constants/aiBrand';
import robotUrl from '../../assets/robot_ai.glb';

function RobotModel() {
  const { scene } = useGLTF(robotUrl);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  return (
    <Center>
      <primitive object={cloned} />
    </Center>
  );
}

useGLTF.preload(robotUrl);

function RobotFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-pulse rounded-full bg-portfolio-elevated" aria-hidden />
    </div>
  );
}

export default function RobotViewer({ className = '' }) {
  return (
    <div
      className={`relative mx-auto h-[min(34vh,13rem)] w-full max-w-[15rem] touch-none ${className}`}
      aria-label={`${AI_BRAND_NAME} robot`}
    >
      <Suspense fallback={<RobotFallback />}>
        <Canvas
          camera={{ position: [0, 0.15, 3], fov: 38, near: 0.1, far: 100 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} />
          <directionalLight position={[-2, 1, -1]} intensity={0.35} />
          <Suspense fallback={null}>
            <Bounds fit observe margin={1.25}>
              <RobotModel />
            </Bounds>
            <Environment preset="city" />
          </Suspense>
          <ContactShadows position={[0, -1.05, 0]} opacity={0.28} scale={5} blur={2.5} far={2.5} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.7}
            target={[0, 0, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
