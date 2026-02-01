/**
 * 3D Particle Background Component
 * Immersive Three.js background with floating particles
 */

'use client';

import * as React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
import * as THREE from 'three';

// =============================================================================
// PARTICLES COMPONENT
// =============================================================================

function Particles({ count = 5000 }: { count?: number }) {
    const pointsRef = React.useRef<THREE.Points>(null);
    const { viewport } = useThree();

    // Generate random positions
    const positions = React.useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
        }
        return positions;
    }, [count]);

    // Animation loop
    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        // Rotate particles slowly
        pointsRef.current.rotation.x += delta * 0.02;
        pointsRef.current.rotation.y += delta * 0.03;

        // Subtle wave motion
        pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00ff9d"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.6}
            />
        </Points>
    );
}

// =============================================================================
// GLOW ORBS COMPONENT
// =============================================================================

function GlowOrb({ position, color, scale = 1 }: {
    position: [number, number, number];
    color: string;
    scale?: number;
}) {
    const meshRef = React.useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Floating animation
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
        meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.5 + position[2]) * 0.3;
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
    );
}

// =============================================================================
// SCENE COMPONENT
// =============================================================================

function Scene() {
    return (
        <>
            {/* Ambient particles */}
            <Particles count={3000} />

            {/* Glow orbs */}
            <GlowOrb position={[-10, 5, -15]} color="#00ff9d" scale={4} />
            <GlowOrb position={[15, -3, -20]} color="#00cc7d" scale={6} />
            <GlowOrb position={[0, 8, -25]} color="#00ff9d" scale={5} />
            <GlowOrb position={[-8, -5, -10]} color="#00aa6d" scale={3} />

            {/* Camera controller */}
            <ambientLight intensity={0.1} />
        </>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ParticleBackgroundProps {
    className?: string;
    /** Reduce particle count for performance */
    performance?: 'low' | 'medium' | 'high';
}

export function ParticleBackground({
    className = '',
    performance = 'medium',
}: ParticleBackgroundProps) {
    const [mounted, setMounted] = React.useState(false);

    // Check for reduced motion preference
    const reducedMotion = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Hydration safe mounting
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Skip rendering if reduced motion is preferred
    if (reducedMotion) {
        return (
            <div
                className={`fixed inset-0 bg-gradient-to-br from-black via-abyss-900 to-black -z-10 ${className}`}
                aria-hidden="true"
            />
        );
    }

    // SSR fallback
    if (!mounted) {
        return (
            <div
                className={`fixed inset-0 bg-black -z-10 ${className}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <div
            className={`fixed inset-0 -z-10 ${className}`}
            aria-hidden="true"
            role="presentation"
        >
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                dpr={[1, performance === 'high' ? 2 : 1.5]}
                gl={{
                    antialias: performance !== 'low',
                    alpha: true,
                    powerPreference: performance === 'low' ? 'low-power' : 'high-performance',
                }}
                style={{ background: 'transparent' }}
            >
                <React.Suspense fallback={null}>
                    <Scene />
                    <Preload all />
                </React.Suspense>
            </Canvas>
        </div>
    );
}

export default ParticleBackground;
