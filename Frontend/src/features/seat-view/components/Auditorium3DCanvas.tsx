"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { computeSeatViewMetrics } from "@/lib/seat-geometry";
import type { Auditorium, Seat } from "@/types/domain";

export type GraphicsQuality = "low" | "medium" | "high";

interface Auditorium3DCanvasProps {
  auditorium: Auditorium;
  seats: Seat[];
  selectedSeatIds: string[];
  activeCameraSeatId: string | null;
  showAcousticRays: boolean;
  isPlayingProjection?: boolean;
  isMuted?: boolean;
  houseLightsOn?: boolean;
  graphicsQuality?: GraphicsQuality;
  localVideoUrl?: string | null;
  movieTitle?: string;
  trailerYoutubeId?: string;
  onSelectSeat: (seatId: string) => void;
}

const OVERVIEW_POS = new THREE.Vector3(9.5, 10.5, 12.5);
const OVERVIEW_TARGET = new THREE.Vector3(0, 1.4, -1.5);

function CameraRig({
  auditorium,
  seats,
  activeCameraSeatId,
}: {
  auditorium: Auditorium;
  seats: Seat[];
  activeCameraSeatId: string | null;
}) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const desiredPos = useRef(OVERVIEW_POS.clone());
  const desiredTarget = useRef(OVERVIEW_TARGET.clone());
  const isTransitioning = useRef(true);
  const lastCameraKeyRef = useRef<string | null>(null);
  const cameraKey = `${auditorium.id}::${activeCameraSeatId ?? "__overview__"}`;

  useEffect(() => {
    if (lastCameraKeyRef.current === cameraKey) return;
    lastCameraKeyRef.current = cameraKey;
    isTransitioning.current = true;

    if (!activeCameraSeatId) {
      desiredPos.current.copy(OVERVIEW_POS);
      desiredTarget.current.copy(OVERVIEW_TARGET);
      return;
    }
    const seat = seats.find((s) => s.id === activeCameraSeatId);
    if (!seat) {
      desiredPos.current.copy(OVERVIEW_POS);
      desiredTarget.current.copy(OVERVIEW_TARGET);
      return;
    }

    const metrics = computeSeatViewMetrics(seat, auditorium);
    const eye = new THREE.Vector3(
      metrics.eyeLevelPosition[0],
      metrics.eyeLevelPosition[1] + 0.12,
      metrics.eyeLevelPosition[2] - 0.14,
    );
    const lookDir = new THREE.Vector3(...metrics.lookAtTarget).sub(eye).normalize();
    desiredPos.current.copy(eye);
    // Keep orbit target close to the viewer's head so dragging rotates naturally like looking around
    desiredTarget.current.copy(eye).addScaledVector(lookDir, 0.85);
  }, [cameraKey, activeCameraSeatId, auditorium, seats]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    if (isTransitioning.current) {
      const step = 1 - Math.exp(-delta * 6.0);
      camera.position.lerp(desiredPos.current, step);
      controlsRef.current.target.lerp(desiredTarget.current, step);

      if (
        camera.position.distanceTo(desiredPos.current) < 0.03 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.03
      ) {
        camera.position.copy(desiredPos.current);
        controlsRef.current.target.copy(desiredTarget.current);
        isTransitioning.current = false;
      }
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableZoom
      minDistance={0.25}
      maxDistance={28}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI * 0.72}
      onStart={() => {
        // Yield immediately to user mouse/touch drag or wheel zoom
        isTransitioning.current = false;
      }}
    />
  );
}

function ExitSignMesh({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#15803D";
      ctx.fillRect(0, 0, 256, 96);
      ctx.strokeStyle = "#4ADE80";
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 250, 90);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 54px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXIT", 128, 50);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.15, 0.42, 0.12]} />
        <meshBasicMaterial color="#15803D" />
      </mesh>
      {texture ? (
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[1.1, 0.38]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function RowLabelSprite({
  label,
  position,
}: {
  label: string;
  position: [number, number, number];
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 96, 96);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "800 56px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 48, 50);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [label]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;
  return (
    <sprite position={position} scale={[0.75, 0.75, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function RealisticSeatMesh({
  seat,
  isSelected,
  isCameraActive,
  isSeatPovActive,
  onSelect,
  onHover,
}: {
  seat: Seat;
  isSelected: boolean;
  isCameraActive: boolean;
  isSeatPovActive: boolean;
  onSelect: (id: string) => void;
  onHover: (seat: Seat | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const { mainColor, trimColor, roughness, metalness } = useMemo(() => {
    if (seat.status === "booked") {
      return { mainColor: "#1D2230", trimColor: "#283042", roughness: 0.68, metalness: 0.05 };
    }
    if (seat.category === "vip") {
      return { mainColor: "#F59E0B", trimColor: "#FBBF24", roughness: 0.34, metalness: 0.14 };
    }
    if (seat.category === "premium") {
      return { mainColor: "#0EA5E9", trimColor: "#38BDF8", roughness: 0.62, metalness: 0.06 };
    }
    if (seat.category === "accessible") {
      return { mainColor: "#10B981", trimColor: "#34D399", roughness: 0.45, metalness: 0.1 };
    }
    // Crisp high-contrast ivory-slate like seats.movie for standard available seats
    return { mainColor: "#DCE3EE", trimColor: "#F1F5F9", roughness: 0.52, metalness: 0.06 };
  }, [seat.status, seat.category]);

  const emissive = isCameraActive
    ? "#A78BFA"
    : isSelected
      ? "#8B5CF6"
      : hovered
        ? "#FFFFFF"
        : "#000000";
  const emissiveIntensity = isCameraActive ? 0.5 : isSelected ? 0.28 : hovered ? 0.14 : 0;

  return (
    <group
      position={seat.position}
      rotation={[0, seat.orientationRad, 0]}
      scale={hovered ? 1.04 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (!isSeatPovActive) onHover(seat);
        document.body.style.cursor = seat.status === "available" ? "pointer" : "not-allowed";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (seat.status === "available") {
          onSelect(seat.id);
        }
      }}
    >
      {/* Selection Halo Ring (preserves true seat material color) */}
      {isSelected || isCameraActive ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.27, 0.35, 24]} />
          <meshBasicMaterial color={isCameraActive ? "#4CD7F6" : "#A78BFA"} side={THREE.DoubleSide} />
        </mesh>
      ) : null}

      {/* Pedestal Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.09, 0.15, 0.2, 12]} />
        <meshStandardMaterial color="#0F1117" roughness={0.5} metalness={0.55} />
      </mesh>

      {/* Contoured Seat Cushion + Sculpted Front Knee-Roll Bolster */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.5, 0.13, 0.44]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      <mesh position={[0, 0.26, -0.22]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.5, 14]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* VIP Footrest Extension */}
      {seat.category === "vip" ? (
        <mesh position={[0, 0.2, -0.33]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.46, 0.08, 0.22]} />
          <meshStandardMaterial color={trimColor} roughness={roughness} metalness={metalness} />
        </mesh>
      ) : null}

      {/* Ergonomic Reclined Backrest + Sculpted Side Bolsters */}
      <mesh position={[0, 0.6, 0.19]} rotation={[0.14, 0, 0]}>
        <boxGeometry args={[0.46, 0.62, 0.11]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      <mesh position={[-0.22, 0.6, 0.16]} rotation={[0.14, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.62, 12]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      <mesh position={[0.22, 0.6, 0.16]} rotation={[0.14, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.62, 12]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Sculpted Rounded Headrest Pillow */}
      <mesh position={[0, 0.94, 0.23]} rotation={[0.14, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 0.38, 14]} />
        <meshStandardMaterial
          color={trimColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity * 0.55}
          roughness={0.42}
        />
      </mesh>

      {/* Left & Right Padded Armrests with Metallic Chrome Cupholders */}
      <mesh position={[-0.28, 0.42, 0.02]}>
        <boxGeometry args={[0.085, 0.085, 0.45]} />
        <meshStandardMaterial color="#181C26" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0.28, 0.42, 0.02]}>
        <boxGeometry args={[0.085, 0.085, 0.45]} />
        <meshStandardMaterial color="#181C26" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[-0.28, 0.465, -0.15]}>
        <cylinderGeometry args={[0.032, 0.028, 0.02, 12]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0.28, 0.465, -0.15]}>
        <cylinderGeometry args={[0.032, 0.028, 0.02, 12]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.85} />
      </mesh>
    </group>
  );
}

function CurvedTheaterScreen({
  auditorium,
  movieTitle,
  trailerYoutubeId,
  localVideoUrl,
  isPlaying,
  isMuted,
}: {
  auditorium: Auditorium;
  movieTitle: string;
  trailerYoutubeId?: string;
  localVideoUrl?: string | null;
  isPlaying: boolean;
  isMuted: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const elapsedRef = useRef(0);
  const [screenReady, setScreenReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setScreenReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Bind local video directly onto the concave 3D screen mesh via VideoTexture
  useEffect(() => {
    if (!localVideoUrl || typeof document === "undefined") {
      if (videoElRef.current) {
        videoElRef.current.pause();
        videoElRef.current = null;
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (materialRef.current && textureRef.current) {
        materialRef.current.map = textureRef.current;
        materialRef.current.needsUpdate = true;
      }
      return;
    }

    const video = document.createElement("video");
    video.src = localVideoUrl;
    video.loop = true;
    video.muted = isMuted;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    if (isPlaying) {
      void video.play().catch(() => {});
    }
    const vTex = new THREE.VideoTexture(video);
    vTex.colorSpace = THREE.SRGBColorSpace;
    videoElRef.current = video;
    videoTextureRef.current = vTex;

    if (materialRef.current) {
      materialRef.current.map = vTex;
      materialRef.current.needsUpdate = true;
    }

    return () => {
      video.pause();
      vTex.dispose();
    };
  }, [localVideoUrl, isPlaying, isMuted]);

  useEffect(() => {
    if (!videoElRef.current) return;
    videoElRef.current.muted = isMuted;
    if (isPlaying) {
      void videoElRef.current.play().catch(() => {});
    } else {
      videoElRef.current.pause();
    }
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    canvasRef.current = canvas;
    textureRef.current = tex;

    if (materialRef.current && !localVideoUrl) {
      materialRef.current.map = tex;
      materialRef.current.needsUpdate = true;
    }

    return () => {
      tex.dispose();
    };
  }, [localVideoUrl]);

  useFrame((_, delta) => {
    if (localVideoUrl) return;
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // When YouTube trailer is playing on screen, keep the curved backing mesh deep cinema black
    // so no bright backdrop peeks out behind the curved edges.
    if (isPlaying && trailerYoutubeId) {
      ctx.fillStyle = "#040508";
      ctx.fillRect(0, 0, 1024, 512);
      texture.needsUpdate = true;
      return;
    }

    if (isPlaying) {
      elapsedRef.current += delta;
    }
    const t = elapsedRef.current;

    // Sleek cinema projection slate when paused or previewing without video
    const bg = ctx.createRadialGradient(512, 240, 40, 512, 256, 560);
    bg.addColorStop(0, "#1E1B3A");
    bg.addColorStop(0.55, "#0D0E18");
    bg.addColorStop(1, "#05060A");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle animated projector light shimmer
    const pulse = 0.08 + Math.sin(t * 1.4) * 0.03;
    ctx.fillStyle = `rgba(167, 139, 250, ${pulse})`;
    ctx.beginPath();
    ctx.ellipse(512, 245, 360, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Widescreen masking bars
    ctx.fillStyle = "#030407";
    ctx.fillRect(0, 0, 1024, 34);
    ctx.fillRect(0, 478, 1024, 34);

    // Centered theatrical title & status
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.font = "800 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(movieTitle.toUpperCase(), 512, 248);

    ctx.fillStyle = "rgba(206, 189, 255, 0.85)";
    ctx.font = "700 16px sans-serif";
    ctx.fillText(
      `${auditorium.format.toUpperCase()} • ${isPlaying ? "PROJECTION LIVE" : "PROJECTION PAUSED — PRESS PLAY"}`,
      512,
      286,
    );

    texture.needsUpdate = true;
  });

  const curveRadius = auditorium.screenCurveRadius > 0 ? auditorium.screenCurveRadius : 48;
  const arcAngle = auditorium.screenWidth / curveRadius;
  const halfW = auditorium.screenWidth / 2;
  const sagitta = curveRadius - Math.sqrt(Math.max(0.01, curveRadius * curveRadius - halfW * halfW));

  return (
    <group
      position={[
        auditorium.screenPosition[0],
        auditorium.screenPosition[1],
        auditorium.screenPosition[2],
      ]}
    >
      {/* Concave Curved Silver Screen facing +Z toward audience */}
      <mesh position={[0, 0, curveRadius]}>
        <cylinderGeometry
          args={[
            curveRadius,
            curveRadius,
            auditorium.screenHeight,
            48,
            1,
            true,
            Math.PI - arcAngle / 2,
            arcAngle,
          ]}
        />
        <meshBasicMaterial
          ref={materialRef}
          color="#FFFFFF"
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>

      {/* In-Screen Cinema Trailer (fitted flush inside screen masking, pointer-events-none for 3D orbit) */}
      {screenReady && !localVideoUrl && trailerYoutubeId ? (
        <Html
          transform
          position={[0, 0, sagitta * 0.45]}
          scale={1}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: `${Math.round((auditorium.screenWidth - 0.4) * 40)}px`,
              height: `${Math.round((auditorium.screenHeight - 0.3) * 40)}px`,
              pointerEvents: "none",
            }}
            className={`relative overflow-hidden bg-black transition-opacity duration-300 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {isPlaying ? (
              <iframe
                key={`${trailerYoutubeId}-${isMuted ? "muted" : "sound"}`}
                src={`https://www.youtube-nocookie.com/embed/${trailerYoutubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&rel=0&playsinline=1&loop=1&playlist=${trailerYoutubeId}`}
                title={`${movieTitle} Cinema Screen`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="pointer-events-none h-full w-full scale-[1.34] border-0"
              />
            ) : null}
            {/* Subtle theatrical vignette & letterbox framing */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_52px_rgba(0,0,0,0.8)]" />
          </div>
        </Html>
      ) : null}

      {/* In-Screen Cinema Trailer (fitted flush inside screen masking, pointer-events-none for 3D orbit) */}
      {screenReady && !localVideoUrl && trailerYoutubeId ? (
        <Html
          transform
          position={[0, 0, sagitta * 0.45]}
          scale={1}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: `${Math.round((auditorium.screenWidth - 0.4) * 40)}px`,
              height: `${Math.round((auditorium.screenHeight - 0.3) * 40)}px`,
              pointerEvents: "none",
            }}
            className={`relative overflow-hidden bg-black transition-opacity duration-300 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {isPlaying ? (
              <iframe
                key={`${trailerYoutubeId}-${isMuted ? "muted" : "sound"}`}
                src={`https://www.youtube-nocookie.com/embed/${trailerYoutubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&rel=0&playsinline=1&loop=1&playlist=${trailerYoutubeId}`}
                title={`${movieTitle} Cinema Screen`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="pointer-events-none h-full w-full scale-[1.34] border-0"
              />
            ) : null}
            {/* Subtle theatrical vignette & letterbox framing */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_52px_rgba(0,0,0,0.8)]" />
          </div>
        </Html>
      ) : null}

      {/* Matte Velvet Masking Frame Top & Bottom */}
      <mesh position={[0, auditorium.screenHeight / 2 + 0.35, 0.2]}>
        <boxGeometry args={[auditorium.screenWidth + 2.4, 0.7, 0.35]} />
        <meshStandardMaterial color="#090A0F" roughness={0.95} />
      </mesh>
      <mesh position={[0, -auditorium.screenHeight / 2 - 0.35, 0.2]}>
        <boxGeometry args={[auditorium.screenWidth + 2.4, 0.7, 0.35]} />
        <meshStandardMaterial color="#090A0F" roughness={0.95} />
      </mesh>

      {/* Left & Right Stage Proscenium Curtains */}
      <mesh position={[-auditorium.screenWidth / 2 - 1.1, 0, 0.4]}>
        <boxGeometry args={[2.2, auditorium.screenHeight + 1.4, 0.6]} />
        <meshStandardMaterial color="#1F1224" roughness={0.85} />
      </mesh>
      <mesh position={[auditorium.screenWidth / 2 + 1.1, 0, 0.4]}>
        <boxGeometry args={[2.2, auditorium.screenHeight + 1.4, 0.6]} />
        <meshStandardMaterial color="#1F1224" roughness={0.85} />
      </mesh>

      {/* Stage Apron */}
      <mesh position={[0, -auditorium.screenHeight / 2 - 0.85, 1.3]}>
        <boxGeometry args={[auditorium.screenWidth + 4, 0.35, 2.4]} />
        <meshStandardMaterial color="#161923" roughness={0.8} />
      </mesh>
    </group>
  );
}

function AcousticRays({ targetSeat }: { targetSeat: Seat | null }) {
  const ringRef = useRef<THREE.Mesh | null>(null);
  const speakerPositions: [number, number, number][] = useMemo(
    () => [
      [-6.5, 9.8, -4.5],
      [6.5, 9.8, -4.5],
      [-6.5, 9.8, 1.5],
      [6.5, 9.8, 1.5],
    ],
    [],
  );

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const pulse = 1 + ((clock.getElapsedTime() * 1.4) % 1) * 1.6;
    ringRef.current.scale.set(pulse, pulse, 1);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 0.75 - ((clock.getElapsedTime() * 1.4) % 1) * 0.75);
  });

  if (!targetSeat) return null;

  return (
    <group>
      {/* Pulsing Dolby Atmos Soundwave Ring around selected seat */}
      <mesh
        ref={ringRef}
        position={[targetSeat.position[0], targetSeat.position[1] + 0.08, targetSeat.position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.55, 0.72, 32]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {speakerPositions.map((sp, idx) => {
        const start = new THREE.Vector3(...sp);
        const end = new THREE.Vector3(
          targetSeat.position[0],
          targetSeat.position[1] + 1.05,
          targetSeat.position[2],
        );
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const len = start.distanceTo(end);
        const dir = end.clone().sub(start).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir,
        );

        return (
          <group key={idx}>
            <mesh position={sp}>
              <boxGeometry args={[0.45, 0.28, 0.45]} />
              <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={mid} quaternion={quat}>
              <cylinderGeometry args={[0.014, 0.014, len, 6]} />
              <meshBasicMaterial color="#22D3EE" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Auditorium3DCanvas({
  auditorium,
  seats,
  selectedSeatIds,
  activeCameraSeatId,
  showAcousticRays,
  isPlayingProjection = true,
  isMuted = true,
  houseLightsOn = true,
  graphicsQuality = "medium",
  localVideoUrl = null,
  movieTitle = "Now Playing",
  trailerYoutubeId,
  onSelectSeat,
}: Auditorium3DCanvasProps) {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const activeSeat = useMemo(
    () => seats.find((s) => s.id === activeCameraSeatId) ?? null,
    [seats, activeCameraSeatId],
  );

  const dpr: [number, number] =
    graphicsQuality === "low" ? [1, 1] : graphicsQuality === "high" ? [1, 2] : [1, 1.5];

  const themeSconceColor =
    auditorium.format === "Dolby Cinema"
      ? "#EF4444"
      : auditorium.format === "ScreenX 270°"
        ? "#06B6D4"
        : auditorium.format === "IMAX with Laser"
          ? "#A78BFA"
          : "#F59E0B";

  return (
    <div className="relative h-full w-full">
      {hoveredSeat && activeCameraSeatId === null ? (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border border-white/20 bg-[#0B0C10]/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          {hoveredSeat.label} •{" "}
          <span className="uppercase text-[#CEBDFF]">{hoveredSeat.category}</span>
          {hoveredSeat.status === "booked" ? (
            <span className="ml-2 text-rose-400">Booked</span>
          ) : (
            <span className="ml-2 text-[#4CD7F6]">${hoveredSeat.price.toFixed(2)}</span>
          )}
        </div>
      ) : null}
      <Canvas
        camera={{ position: [9.5, 10.5, 12.5], fov: 58, near: 0.1, far: 140 }}
        dpr={dpr}
        className="h-full w-full"
      >
      <color attach="background" args={[houseLightsOn ? "#0B0C12" : "#040508"]} />
      <fog attach="fog" args={[houseLightsOn ? "#0B0C12" : "#040508", 26, 52]} />

      {/* Balanced Auditorium Lighting (dimmable for Movie Mode) */}
      <hemisphereLight args={["#E2E8F0", "#1E293B", houseLightsOn ? 0.95 : 0.35]} />
      <directionalLight position={[0, 14, 10]} intensity={houseLightsOn ? 1.05 : 0.32} color="#F8FAFC" />
      <pointLight
        position={[
          auditorium.screenPosition[0],
          auditorium.screenPosition[1],
          auditorium.screenPosition[2] + 5,
        ]}
        intensity={houseLightsOn ? 28 : 38}
        distance={34}
        color="#FDE68A"
      />

      {/* Auditorium Carpeted Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial color="#0F1118" roughness={0.92} />
      </mesh>

      {/* Cutaway Acoustic Side Walls (Open-top Dollhouse View for unobstructed 3D Hall Orbit) */}
      <mesh position={[-12.5, 3.6, -1]}>
        <boxGeometry args={[0.35, 7.2, 28]} />
        <meshStandardMaterial color="#12141C" roughness={0.9} />
      </mesh>
      <mesh position={[12.5, 3.6, -1]}>
        <boxGeometry args={[0.35, 7.2, 28]} />
        <meshStandardMaterial color="#12141C" roughness={0.9} />
      </mesh>

      {/* Glowing Green EXIT Signs flanking the screen (pure WebGL texture, zero React root unmount race) */}
      <ExitSignMesh position={[-10.8, 3.2, -10.8]} />
      <ExitSignMesh position={[10.8, 3.2, -10.8]} />

      {[-7, -3.5, 0, 3.5, 7].map((zPos) => (
        <group key={zPos}>
          {/* Left & Right Theme Wall Sconces */}
          <mesh position={[-12.22, 4.6, zPos]}>
            <boxGeometry args={[0.08, 3.2, 0.55]} />
            <meshStandardMaterial
              color="#1F1224"
              emissive={themeSconceColor}
              emissiveIntensity={houseLightsOn ? 0.55 : 0.1}
            />
          </mesh>
          {houseLightsOn ? (
            <mesh position={[-12.16, 3.5, zPos]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshBasicMaterial color="#FEF3C7" />
            </mesh>
          ) : null}
          <mesh position={[12.22, 4.6, zPos]}>
            <boxGeometry args={[0.08, 3.2, 0.55]} />
            <meshStandardMaterial
              color="#1F1224"
              emissive={themeSconceColor}
              emissiveIntensity={houseLightsOn ? 0.55 : 0.1}
            />
          </mesh>
          {houseLightsOn ? (
            <mesh position={[12.16, 3.5, zPos]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshBasicMaterial color="#FEF3C7" />
            </mesh>
          ) : null}

          {/* Wall-Mounted Angled Surround Speakers */}
          <mesh position={[-11.8, 6.2, zPos]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.45, 0.65, 0.45]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[11.8, 6.2, zPos]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.45, 0.65, 0.45]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Stepped Stadium Risers + Amber Aisle Step Lights + 3D Row Labels */}
      {auditorium.rows.map((row) => (
        <group key={row.rowLabel} position={[0, row.elevationY - 0.1, row.zOffset]}>
          <mesh>
            <boxGeometry args={[20, 0.22, 1.45]} />
            <meshStandardMaterial color="#181C28" roughness={0.85} />
          </mesh>
          <mesh position={[-8.6, 0.12, -0.65]}>
            <boxGeometry args={[0.35, 0.03, 0.12]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          <mesh position={[8.6, 0.12, -0.65]}>
            <boxGeometry args={[0.35, 0.03, 0.12]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          <RowLabelSprite label={row.rowLabel} position={[-9.5, 0.25, 0]} />
          <RowLabelSprite label={row.rowLabel} position={[9.5, 0.25, 0]} />
        </group>
      ))}

      {/* Concave Curved Theater Screen & Curtains */}
      <CurvedTheaterScreen
        auditorium={auditorium}
        movieTitle={movieTitle}
        trailerYoutubeId={trailerYoutubeId}
        localVideoUrl={localVideoUrl}
        isPlaying={isPlayingProjection}
        isMuted={isMuted}
      />

      {/* Realistic Seats */}
      {seats.map((seat) => (
        <RealisticSeatMesh
          key={seat.id}
          seat={seat}
          isSelected={selectedSeatIds.includes(seat.id)}
          isCameraActive={activeCameraSeatId === seat.id}
          isSeatPovActive={activeCameraSeatId !== null}
          onSelect={onSelectSeat}
          onHover={setHoveredSeat}
        />
      ))}

      {/* Dolby Atmos Acoustic Rays */}
      {showAcousticRays ? <AcousticRays targetSeat={activeSeat} /> : null}

      <CameraRig
        auditorium={auditorium}
        seats={seats}
        activeCameraSeatId={activeCameraSeatId}
      />
    </Canvas>
    </div>
  );
}
