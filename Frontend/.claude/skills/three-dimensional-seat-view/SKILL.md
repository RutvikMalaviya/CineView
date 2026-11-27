---
name: three-dimensional-seat-view
description: Standards for the React Three Fiber 3D auditorium and geometry-derived eye-level seat camera.
---

# 3D Seat View Skill

1. Always load the R3F `<Canvas>` via `next/dynamic(..., { ssr: false })` with a loading skeleton and WebGL error/non-3D fallback.
2. Derive camera position `[x, eyeHeight, z]` and lookAt target from the selected seat's 3D coordinates and the screen's geometry—never hardcode per-seat camera coordinates.
3. Synchronize selected seats with `useSeatSelectionStore` so 2D seat map clicks immediately move the 3D camera.
4. Provide smooth interpolation (`useFrame` + `lerp`), overview reset, and dual-seat comparison support.
