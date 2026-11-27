"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("screen_types", {
      id: { type: Sequelize.STRING(40), primaryKey: true, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.BIGINT, allowNull: false },
      created_by: { type: Sequelize.STRING(40), allowNull: false },
      updated_at: { type: Sequelize.BIGINT, allowNull: true },
      updated_by: { type: Sequelize.STRING(40), allowNull: true },
      deleted_at: { type: Sequelize.BIGINT, allowNull: true },
      deleted_by: { type: Sequelize.STRING(40), allowNull: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      name: { type: Sequelize.STRING(80), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: false, defaultValue: "" },
    });

    await queryInterface.addIndex("screen_types", ["name"], {
      unique: true,
      where: { is_deleted: false },
      name: "screen_types_name_unique_active",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("screen_types");
  },
};
