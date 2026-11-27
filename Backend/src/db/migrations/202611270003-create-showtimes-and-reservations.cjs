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

    await queryInterface.createTable("showtimes", {
      ...auditColumns,
      movie_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "movies", key: "id" },
      },
      cinema_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "cinemas", key: "id" },
      },
      auditorium_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "auditoriums", key: "id" },
      },
      date: { type: Sequelize.STRING(20), allowNull: false },
      time: { type: Sequelize.STRING(10), allowNull: false },
      format: { type: Sequelize.STRING(60), allowNull: false },
      language: { type: Sequelize.STRING(40), allowNull: false, defaultValue: "English" },
      base_price: { type: Sequelize.FLOAT, allowNull: false },
      total_seats: { type: Sequelize.INTEGER, allowNull: false },
      badge: { type: Sequelize.STRING(60), allowNull: true },
    });

    await queryInterface.addIndex("showtimes", ["movie_id", "cinema_id", "date"], {
      name: "showtimes_lookup_idx",
    });

    await queryInterface.createTable("seat_reservations", {
      ...auditColumns,
      reservation_group_id: { type: Sequelize.STRING(40), allowNull: false },
      showtime_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "showtimes", key: "id" },
      },
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      seat_label: { type: Sequelize.STRING(16), allowNull: false },
      status: {
        type: Sequelize.ENUM("RESERVED", "CONFIRMED", "EXPIRED", "RELEASED"),
        allowNull: false,
        defaultValue: "RESERVED",
      },
      expires_at: { type: Sequelize.BIGINT, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX seat_reservations_active_unique
      ON seat_reservations (showtime_id, seat_label)
      WHERE status IN ('RESERVED', 'CONFIRMED') AND is_deleted = false;
    `);

    await queryInterface.addIndex("seat_reservations", ["status", "expires_at"], {
      name: "seat_reservations_expiry_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("seat_reservations");
    await queryInterface.dropTable("showtimes");
  },
};
