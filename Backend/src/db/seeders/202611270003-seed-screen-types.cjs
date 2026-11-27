"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = Math.floor(Date.now() / 1000);
    const audit = {
      is_active: true,
      created_at: now,
      created_by: "seeder",
      is_deleted: false,
    };

    await queryInterface.bulkInsert("screen_types", [
      { ...audit, id: "st-type-imax", name: "IMAX with Laser", description: "Dual 4K laser projection with 12-channel sound." },
      { ...audit, id: "st-type-dolby", name: "Dolby Cinema", description: "Dolby Vision HDR + Dolby Atmos spatial audio." },
      { ...audit, id: "st-type-70mm", name: "70mm Film", description: "Analog 70mm celluloid presentation." },
      { ...audit, id: "st-type-screenx", name: "ScreenX 270°", description: "Panoramic 270-degree three-wall projection." },
      { ...audit, id: "st-type-2d", name: "Standard 2D", description: "Calibrated 4K digital projection." },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("screen_types", null, {});
  },
};
