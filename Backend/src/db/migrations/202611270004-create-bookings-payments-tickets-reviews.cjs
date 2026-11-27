"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const auditColumns = {
      id: { type: Sequelize.STRING(40), primaryKey: true, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.BIGINT, allowNull: false },
      created_by: { type: Sequelize.STRING(40), allowNull: false },
      updated_at: { type: Sequelize.BIGINT, allowNull: true },
      updated_by: { type: Sequelize.STRING(40), allowNull: true },
      deleted_at: { type: Sequelize.BIGINT, allowNull: true },
      deleted_by: { type: Sequelize.STRING(40), allowNull: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    };

    await queryInterface.createTable("bookings", {
      ...auditColumns,
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      reference_code: { type: Sequelize.STRING(32), allowNull: false },
      movie_id: { type: Sequelize.STRING(40), allowNull: false },
      movie_title: { type: Sequelize.STRING(200), allowNull: false },
      poster_url: { type: Sequelize.STRING(500), allowNull: false },
      cinema_id: { type: Sequelize.STRING(40), allowNull: false },
      cinema_name: { type: Sequelize.STRING(180), allowNull: false },
      auditorium_id: { type: Sequelize.STRING(40), allowNull: false },
      auditorium_name: { type: Sequelize.STRING(150), allowNull: false },
      showtime_id: { type: Sequelize.STRING(40), allowNull: false },
      format: { type: Sequelize.STRING(60), allowNull: false },
      date: { type: Sequelize.STRING(20), allowNull: false },
      time: { type: Sequelize.STRING(10), allowNull: false },
      seats: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      concessions: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      offer_code: { type: Sequelize.STRING(40), allowNull: true },
      subtotal: { type: Sequelize.FLOAT, allowNull: false },
      convenience_fee: { type: Sequelize.FLOAT, allowNull: false },
      discount: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.FLOAT, allowNull: false },
      status: {
        type: Sequelize.ENUM("pending_payment", "confirmed", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending_payment",
      },
      payment_method_label: { type: Sequelize.STRING(100), allowNull: false },
      contact_name: { type: Sequelize.STRING(120), allowNull: false },
      contact_email: { type: Sequelize.STRING(255), allowNull: false },
    });

    await queryInterface.addIndex("bookings", ["reference_code"], {
      unique: true,
      where: { is_deleted: false },
      name: "bookings_reference_unique_active",
    });

    await queryInterface.createTable("payments", {
      ...auditColumns,
      booking_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "bookings", key: "id" },
      },
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      provider: { type: Sequelize.STRING(40), allowNull: false },
      payment_intent_id: { type: Sequelize.STRING(120), allowNull: false },
      client_secret: { type: Sequelize.STRING(200), allowNull: false },
      amount_cents: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "usd" },
      status: {
        type: Sequelize.ENUM(
          "requires_payment_method",
          "requires_confirmation",
          "succeeded",
          "failed",
          "canceled",
        ),
        allowNull: false,
        defaultValue: "requires_confirmation",
      },
      idempotency_key: { type: Sequelize.STRING(100), allowNull: false },
      failure_reason: { type: Sequelize.STRING(255), allowNull: true },
    });

    await queryInterface.addIndex("payments", ["idempotency_key"], {
      unique: true,
      where: { is_deleted: false },
      name: "payments_idempotency_unique",
    });

    await queryInterface.createTable("payment_webhook_events", {
      ...auditColumns,
      event_id: { type: Sequelize.STRING(120), allowNull: false },
      provider: { type: Sequelize.STRING(40), allowNull: false },
      event_type: { type: Sequelize.STRING(100), allowNull: false },
      payload: { type: Sequelize.JSONB, allowNull: false },
      processed_at: { type: Sequelize.BIGINT, allowNull: false },
    });

    await queryInterface.addIndex("payment_webhook_events", ["event_id"], {
      unique: true,
      name: "payment_webhook_events_event_id_unique",
    });

    await queryInterface.createTable("tickets", {
      ...auditColumns,
      booking_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "bookings", key: "id" },
      },
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      reference_code: { type: Sequelize.STRING(32), allowNull: false },
      gate: { type: Sequelize.STRING(120), allowNull: false },
      qr_payload: { type: Sequelize.STRING(500), allowNull: false },
      voucher_code: { type: Sequelize.STRING(60), allowNull: false },
      status: {
        type: Sequelize.ENUM("VALID", "USED", "CANCELLED"),
        allowNull: false,
        defaultValue: "VALID",
      },
      verified_at: { type: Sequelize.BIGINT, allowNull: true },
    });

    await queryInterface.addIndex("tickets", ["booking_id"], {
      unique: true,
      where: { is_deleted: false },
      name: "tickets_booking_unique_active",
    });

    await queryInterface.createTable("reviews", {
      ...auditColumns,
      movie_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "movies", key: "id" },
      },
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reviews");
    await queryInterface.dropTable("tickets");
    await queryInterface.dropTable("payment_webhook_events");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("bookings");
  },
};
