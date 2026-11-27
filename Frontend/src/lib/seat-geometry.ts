import type { Auditorium, Seat } from "@/types/domain";

export interface SeatViewMetrics {
  distanceMeters: number;
  horizontalAngleDeg: number;
  verticalAngleDeg: number;
  horizontalFovDeg: number;
  neckTiltLabel: "Comfortable" | "Slight Tilt" | "Neck Strain";
  eyeLevelPosition: [number, number, number];
  lookAtTarget: [number, number, number];
  acousticScore: number;
  overallScore: number;
  viewQualityLabel: "Optimal Sweet Spot" | "Immersive Front" | "Balanced Mid" | "Elevated Rear";
}

const SEATED_EYE_HEIGHT_METERS = 1.12;

/**
 * Derives 3D eye-level camera position, look-at target, distance, THX/SMPTE FOV,
 * vertical neck tilt, acoustic score, and overall 0-100 seat score.
 */
export function computeSeatViewMetrics(
  seat: Seat,
  auditorium: Auditorium,
): SeatViewMetrics {
  const [sx, sy, sz] = seat.position;
  const [tx, ty, tz] = auditorium.screenPosition;

  const eyeLevelPosition: [number, number, number] = [
    sx,
    sy + SEATED_EYE_HEIGHT_METERS,
    sz,
  ];
  const lookAtTarget: [number, number, number] = [tx, ty, tz];

  const dx = tx - eyeLevelPosition[0];
  const dy = ty - eyeLevelPosition[1];
  const dz = tz - eyeLevelPosition[2];

  const horizontalDistance = Math.hypot(dx, dz);
  const distanceMeters = Number(Math.hypot(dx, dy, dz).toFixed(1));

  // Horizontal angle off center axis (0° = dead center)
  const horizontalAngleDeg = Number(
    Math.abs((Math.atan2(dx, Math.abs(dz) || 1) * 180) / Math.PI).toFixed(1),
  );

  // Vertical elevation angle toward screen center (neck tilt)
  const verticalAngleDeg = Number(
    ((Math.atan2(dy, horizontalDistance || 1) * 180) / Math.PI).toFixed(1),
  );

  // Horizontal Field of View (THX recommends 36°-55°)
  const horizontalFovDeg = Number(
    (
      2 *
      Math.atan(auditorium.screenWidth / 2 / (horizontalDistance || 1)) *
      (180 / Math.PI)
    ).toFixed(1),
  );

  const neckTiltLabel: SeatViewMetrics["neckTiltLabel"] =
    verticalAngleDeg > 22
      ? "Neck Strain"
      : verticalAngleDeg > 14
        ? "Slight Tilt"
        : "Comfortable";

  // Acoustic & viewing quality score (0-100)
  const idealDistance = auditorium.screenWidth * 1.15;
  const distancePenalty = Math.min(28, Math.abs(distanceMeters - idealDistance) * 2.0);
  const anglePenalty = Math.min(25, horizontalAngleDeg * 0.85);
  const tiltPenalty = verticalAngleDeg > 18 ? (verticalAngleDeg - 18) * 1.1 : 0;
  const acousticScore = Math.max(58, Math.round(99 - distancePenalty - anglePenalty));
  const overallScore = Math.max(
    45,
    Math.min(99, Math.round(99 - distancePenalty * 0.85 - anglePenalty - tiltPenalty)),
  );

  let viewQualityLabel: SeatViewMetrics["viewQualityLabel"] = "Balanced Mid";
  if (overallScore >= 88) {
    viewQualityLabel = "Optimal Sweet Spot";
  } else if (distanceMeters < auditorium.screenWidth * 0.8) {
    viewQualityLabel = "Immersive Front";
  } else if (distanceMeters > auditorium.screenWidth * 1.45) {
    viewQualityLabel = "Elevated Rear";
  }

  return {
    distanceMeters,
    horizontalAngleDeg,
    verticalAngleDeg,
    horizontalFovDeg,
    neckTiltLabel,
    eyeLevelPosition,
    lookAtTarget,
    acousticScore,
    overallScore,
    viewQualityLabel,
  };
}

/**
 * Finds the highest-scoring contiguous block of `groupSize` available seats in the same row.
 */
export function findBestGroupSeats(
  seats: Seat[],
  auditorium: Auditorium,
  groupSize: number,
): Seat[] {
  if (groupSize < 1) return [];
  const rows = new Map<string, Seat[]>();
  for (const seat of seats) {
    const list = rows.get(seat.row) ?? [];
    list.push(seat);
    rows.set(seat.row, list);
  }

  let bestBlock: Seat[] = [];
  let bestAvgScore = -1;

  for (const [, rowSeats] of rows) {
    const sorted = [...rowSeats].sort((a, b) => a.number - b.number);
    for (let i = 0; i <= sorted.length - groupSize; i++) {
      const slice = sorted.slice(i, i + groupSize);
      const contiguous = slice.every(
        (s, idx) =>
          s.status === "available" &&
          (idx === 0 || s.number === slice[idx - 1].number + 1),
      );
      if (!contiguous) continue;

      const avg =
        slice.reduce(
          (sum, s) => sum + computeSeatViewMetrics(s, auditorium).overallScore,
          0,
        ) / groupSize;
      if (avg > bestAvgScore) {
        bestAvgScore = avg;
        bestBlock = slice;
      }
    }
  }

  return bestBlock;
}
