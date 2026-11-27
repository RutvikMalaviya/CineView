"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const auditColumns = {
      id: {
        type: Sequelize.STRING(40),
        primaryKey: true,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      deleted_by: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    };

    await queryInterface.createTable("users", {
      ...auditColumns,
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("CUSTOMER", "CINEMA_ADMIN", "SUPER_ADMIN"),
        allowNull: false,
        defaultValue: "CUSTOMER",
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      phone: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tier: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "Cinephile • Member",
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      preferred_format: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: "IMAX with Laser",
      },
      preferred_row_zone: {
        type: Sequelize.ENUM("front", "center", "rear"),
        allowNull: false,
        defaultValue: "center",
      },
      accessibility_needs: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      saved_cinema_ids: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      notifications: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          showtimeAlerts: true,
          premiereInvites: true,
          smsTicketUpdates: false,
        },
      },
    });

    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      where: { is_deleted: false },
      name: "users_email_unique_active",
    });

    await queryInterface.createTable("email_verifications", {
      ...auditColumns,
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      token_hash: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      used_at: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });

    await queryInterface.createTable("password_resets", {
      ...auditColumns,
      user_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      token_hash: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      used_at: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("password_resets");
    await queryInterface.dropTable("email_verifications");
    await queryInterface.dropTable("users");
  },
};
