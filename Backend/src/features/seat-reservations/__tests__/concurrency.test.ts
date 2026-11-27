import { UniqueConstraintError } from "sequelize";
import { sequelize } from "../../../config/database";
import { SeatReservationModel } from "../seat-reservation.model";
import { reserveSeatsForShowtime } from "../seat-reservations.service";

describe("Seat Reservations Concurrency", () => {
  it("maps PostgreSQL UniqueConstraintError to 409 SEATS_UNAVAILABLE", async () => {
    jest.spyOn(sequelize, "transaction").mockImplementationOnce((async (cb: unknown) => {
      const fn = cb as (t: unknown) => Promise<unknown>;
      return fn({});
    }) as never);
    jest.spyOn(SeatReservationModel, "update").mockResolvedValueOnce([0] as never);
    jest.spyOn(SeatReservationModel, "findAll").mockResolvedValueOnce([] as never);
    jest
      .spyOn(SeatReservationModel, "bulkCreate")
      .mockRejectedValueOnce(new UniqueConstraintError({ message: "duplicate key" }));

    await expect(
      reserveSeatsForShowtime({
        showtimeId: "st-1",
        userId: "usr-2",
        seatLabels: ["E-7"],
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "SEATS_UNAVAILABLE",
    });
  });
});
