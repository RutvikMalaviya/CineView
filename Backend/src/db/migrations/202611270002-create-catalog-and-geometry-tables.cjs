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

    await queryInterface.createTable("movies", {
      ...auditColumns,
      slug: { type: Sequelize.STRING(160), allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      tagline: { type: Sequelize.STRING(300), allowNull: false, defaultValue: "" },
      description: { type: Sequelize.TEXT, allowNull: false },
      genres: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false },
      rating: { type: Sequelize.STRING(20), allowNull: false },
      language: { type: Sequelize.STRING(60), allowNull: false },
      release_date: { type: Sequelize.STRING(20), allowNull: false },
      status: {
        type: Sequelize.ENUM("now_showing", "coming_soon"),
        allowNull: false,
        defaultValue: "now_showing",
      },
      formats: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      poster_url: { type: Sequelize.STRING(500), allowNull: false },
      backdrop_url: { type: Sequelize.STRING(500), allowNull: false },
      trailer_duration: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "2:15" },
      trailer_youtube_id: { type: Sequelize.STRING(40), allowNull: false, defaultValue: "" },
      director: { type: Sequelize.STRING(120), allowNull: false },
      cast: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      popularity_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 80 },
      recommended: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });

    await queryInterface.addIndex("movies", ["slug"], {
      unique: true,
      where: { is_deleted: false },
      name: "movies_slug_unique_active",
    });

    await queryInterface.createTable("cinemas", {
      ...auditColumns,
      name: { type: Sequelize.STRING(180), allowNull: false },
      tier: { type: Sequelize.STRING(80), allowNull: false, defaultValue: "Flagship" },
      city: { type: Sequelize.STRING(100), allowNull: false },
      address: { type: Sequelize.STRING(300), allowNull: false },
      distance_miles: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 1.0 },
      facilities: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      parking_info: { type: Sequelize.STRING(300), allowNull: false, defaultValue: "" },
      admin_user_id: {
        type: Sequelize.STRING(40),
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    });

    await queryInterface.createTable("auditoriums", {
      ...auditColumns,
      cinema_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "cinemas", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      format: { type: Sequelize.STRING(60), allowNull: false },
      screen_width: { type: Sequelize.FLOAT, allowNull: false },
      screen_height: { type: Sequelize.FLOAT, allowNull: false },
      screen_position: { type: Sequelize.JSONB, allowNull: false },
      screen_curve_radius: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 48 },
      speaker_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 16 },
      acoustic_profile: {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: "Dolby Atmos 64-Channel",
      },
      rows: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      default_rows: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
    });

    await queryInterface.createTable("offers", {
      ...auditColumns,
      code: { type: Sequelize.STRING(40), allowNull: false },
      title: { type: Sequelize.STRING(160), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      discount_type: {
        type: Sequelize.ENUM("percentage", "fixed", "perk"),
        allowNull: false,
      },
      discount_value: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      min_tickets: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      accent: {
        type: Sequelize.ENUM("primary", "secondary", "tertiary"),
        allowNull: false,
        defaultValue: "primary",
      },
    });

    await queryInterface.addIndex("offers", ["code"], {
      unique: true,
      where: { is_deleted: false },
      name: "offers_code_unique_active",
    });

    await queryInterface.createTable("concessions", {
      ...auditColumns,
      name: { type: Sequelize.STRING(160), allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      category: { type: Sequelize.STRING(60), allowNull: false, defaultValue: "snack" },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("concessions");
    await queryInterface.dropTable("offers");
    await queryInterface.dropTable("auditoriums");
    await queryInterface.dropTable("cinemas");
    await queryInterface.dropTable("movies");
  },
};
