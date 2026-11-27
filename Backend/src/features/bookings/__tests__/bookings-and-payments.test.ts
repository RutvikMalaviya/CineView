import crypto from "crypto";
import request from "supertest";
import { createApp } from "../../../app";
import { PaymentWebhookEventModel } from "../../payments/payment.model";

jest.mock("../../showtimes", () => {
  const actual = jest.requireActual("../../showtimes");
  return {
    ...actual,
    getShowtimeById: jest.fn().mockResolvedValue({
      id: "st-dune-imax-1915",
      movieId: "mov-dune-part-two",
      cinemaId: "cin-premiere-dome",
      auditoriumId: "aud-imax-gt",
      date: "2026-11-28",
      time: "19:15",
      format: "IMAX with Laser",
      language: "English",
      basePrice: 22.0,
      totalSeats: 10,
    }),
  };
});

jest.mock("../../movies", () => {
  const actual = jest.requireActual("../../movies");
  return {
    ...actual,
    getMovieByIdOrSlug: jest.fn().mockResolvedValue({
      id: "mov-dune-part-two",
      title: "Dune: Part Two",
      posterUrl: "/images/posters/dune-part-two.jpg",
    }),
  };
});

jest.mock("../../cinemas", () => {
  const actual = jest.requireActual("../../cinemas");
  return {
    ...actual,
    getCinemaById: jest.fn().mockResolvedValue({
      id: "cin-premiere-dome",
      name: "CineView Premiere Dome",
    }),
  };
});

jest.mock("../../auditoriums", () => {
  const actual = jest.requireActual("../../auditoriums");
  return {
    ...actual,
    getAuditoriumById: jest.fn().mockResolvedValue({
      id: "aud-imax-gt",
      cinemaId: "cin-premiere-dome",
      name: "Screen 1 • IMAX GT",
      format: "IMAX with Laser",
      screenWidth: 26,
      screenHeight: 19,
      screenPosition: [0, 6.5, -14],
      screenCurveRadius: 48,
      speakerCount: 64,
      acousticProfile: "IMAX 12-Channel",
      rows: [
        {
          rowLabel: "E",
          seatCount: 10,
          aisleAfterSeats: [5],
          category: "premium",
          priceMultiplier: 1.15,
          elevationY: 2.0,
          zOffset: 4,
        },
      ],
      defaultRows: [],
    }),
  };
});

jest.mock("../../concessions", () => {
  const actual = jest.requireActual("../../concessions");
  return {
    ...actual,
    getConcessionsByIds: jest.fn().mockResolvedValue([
      { id: "con-popcorn", name: "Artisan Truffle Popcorn", price: 9.5 },
    ]),
  };
});

jest.mock("../../offers", () => {
  const actual = jest.requireActual("../../offers");
  return {
    ...actual,
    findOfferByCode: jest.fn().mockResolvedValue({
      id: "off-cine15",
      code: "CINE15",
      discountType: "percentage",
      discountValue: 15,
      minTickets: 2,
    }),
  };
});

jest.mock("../../seat-reservations", () => {
  const actual = jest.requireActual("../../seat-reservations");
  return {
    ...actual,
    confirmSeatReservations: jest.fn().mockResolvedValue(undefined),
    releaseSeatsForBooking: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../payments/payment.model", () => ({
  PaymentModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  PaymentWebhookEventModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("Payments Webhook & Idempotency", () => {
  const app = createApp();

  it("rejects payment webhook with invalid signature", async () => {
    const res = await request(app)
      .post("/api/v1/payments/webhook")
      .set("stripe-signature", "t=123,v1=invalid")
      .send({ id: "evt_1", type: "payment_intent.succeeded", data: {} });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_WEBHOOK_SIGNATURE");
  });

  it("accepts signed demo webhook and handles duplicate delivery idempotently", async () => {
    const payload = { id: "evt_demo_123", type: "payment_intent.succeeded", data: { ok: true } };
    const payloadString = JSON.stringify(payload);
    const ts = Math.floor(Date.now() / 1000).toString();
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_demo_cineview_secret";
    const sig = crypto.createHmac("sha256", secret).update(`${ts}.${payloadString}`).digest("hex");

    (PaymentWebhookEventModel.findOne as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing" });
    (PaymentWebhookEventModel.create as jest.Mock).mockResolvedValueOnce({});

    const first = await request(app)
      .post("/api/v1/payments/webhook")
      .set("stripe-signature", `t=${ts},v1=${sig}`)
      .send(payload);

    expect(first.status).toBe(200);
    expect(first.body.data.duplicate).toBe(false);

    const second = await request(app)
      .post("/api/v1/payments/webhook")
      .set("stripe-signature", `t=${ts},v1=${sig}`)
      .send(payload);

    expect(second.status).toBe(200);
    expect(second.body.data.duplicate).toBe(true);
  });
});
