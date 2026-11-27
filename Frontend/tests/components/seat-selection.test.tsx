import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AUDITORIUMS_DATA } from "@/data/auditoriums";
import { SeatComparisonPanel } from "@/features/seat-comparison/components/SeatComparisonPanel";
import { SeatMap2D } from "@/features/seat-selection/components/SeatMap2D";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";
import type { Seat } from "@/types/domain";

const MOCK_SEATS: Seat[] = [
  {
    id: "E-1",
    row: "E",
    number: 1,
    label: "E-1",
    category: "premium",
    status: "available",
    price: 25.3,
    position: [-2, 2.2, 0.8],
    orientationRad: 0,
  },
  {
    id: "E-2",
    row: "E",
    number: 2,
    label: "E-2",
    category: "vip",
    status: "available",
    price: 31.9,
    position: [0, 2.2, 0.8],
    orientationRad: 0,
  },
  {
    id: "E-3",
    row: "E",
    number: 3,
    label: "E-3",
    category: "standard",
    status: "booked",
    price: 22.0,
    position: [2, 2.2, 0.8],
    orientationRad: 0,
  },
];

describe("SeatMap2D and SeatComparisonPanel", () => {
  beforeEach(() => {
    useSeatSelectionStore.setState({
      showtimeId: "st-test",
      auditorium: {
        ...AUDITORIUMS_DATA[0],
        rows: [AUDITORIUMS_DATA[0].rows[4]],
      },
      seats: MOCK_SEATS,
      selectedSeatIds: [],
      activeCameraSeatId: null,
      comparisonSeatIds: [],
    });
  });

  it("selects and deselects available seats and updates activeCameraSeatId", () => {
    render(<SeatMap2D />);
    const seat1 = screen.getByRole("button", { name: /Seat E-1/i });
    const seat3 = screen.getByRole("button", { name: /Seat E-3/i });

    expect(seat3).toBeDisabled();

    fireEvent.click(seat1);
    expect(useSeatSelectionStore.getState().selectedSeatIds).toEqual(["E-1"]);
    expect(useSeatSelectionStore.getState().activeCameraSeatId).toBe("E-1");

    fireEvent.click(seat1);
    expect(useSeatSelectionStore.getState().selectedSeatIds).toEqual([]);
    expect(useSeatSelectionStore.getState().activeCameraSeatId).toBeNull();
  });

  it("displays compared seats and updates 3D camera target when Preview button is clicked", () => {
    useSeatSelectionStore.getState().toggleSeat("E-1");
    useSeatSelectionStore.getState().toggleSeat("E-2");

    render(<SeatComparisonPanel />);
    expect(screen.getByText("Seat E-1")).toBeInTheDocument();
    expect(screen.getByText("Seat E-2")).toBeInTheDocument();

    const previewE1 = screen.getByRole("button", { name: /Preview 3D View from E-1/i });
    fireEvent.click(previewE1);
    expect(useSeatSelectionStore.getState().activeCameraSeatId).toBe("E-1");
  });
});
