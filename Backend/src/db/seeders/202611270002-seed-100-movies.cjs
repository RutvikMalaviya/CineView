"use strict";

const POSTER_POOL = [
  "/images/posters/oppenheimer.jpg",
  "/images/posters/blade-runner-2049.jpg",
  "/images/posters/dark-knight.jpg",
  "/images/posters/inception.jpg",
  "/images/posters/spider-verse.jpg",
  "/images/posters/dune-2021.jpg",
  "/images/posters/orbital-horizon.svg",
  "/images/posters/hypersonic-drift.svg",
  "/images/posters/chrono-overdrive.svg",
  "/images/posters/synthesis-zero.svg",
  "/images/posters/echo-chamber.svg",
  "/images/posters/kuroshio.svg",
  "/images/posters/requiem-solitude.svg",
  "/images/posters/void-polar.svg",
];

const GENRE_SETS = [
  ["Sci-Fi", "Action", "Adventure"],
  ["Drama", "Thriller"],
  ["Action", "Sci-Fi"],
  ["Mystery", "Sci-Fi", "Drama"],
  ["Animation", "Action", "Adventure"],
  ["Biography", "Drama", "History"],
];

const FORMAT_SETS = [
  ["IMAX with Laser", "Dolby Cinema", "Standard 2D"],
  ["70mm Film", "IMAX with Laser"],
  ["Dolby Cinema", "ScreenX 270°", "Standard 2D"],
  ["IMAX with Laser", "Standard 2D"],
];

const DIRECTORS = [
  "Denis Villeneuve",
  "Christopher Nolan",
  "Ridley Scott",
  "Alex Garland",
  "Greta Gerwig",
  "Bong Joon-ho",
  "Celine Song",
  "Ryan Coogler",
];

const TITLES = [
  "Oppenheimer",
  "Blade Runner 2049",
  "The Dark Knight",
  "Inception",
  "Spider-Man: Across the Spider-Verse",
  "Dune (2021)",
  "Orbital Horizon",
  "Hypersonic Drift",
  "Chrono Overdrive",
  "Synthesis Zero",
  "Echo Chamber",
  "Kuroshio Current",
  "Requiem for Solitude",
  "Void Polar",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = Math.floor(Date.now() / 1000);
    const movies = [];

    for (let i = 1; i <= 98; i++) {
      const baseTitle = TITLES[(i - 1) % TITLES.length];
      const edition = i > TITLES.length ? ` — Chapter ${Math.ceil(i / TITLES.length)}` : "";
      const title = `${baseTitle}${edition}`;
      const slug = `cineview-feature-${String(i).padStart(3, "0")}`;
      const poster = POSTER_POOL[(i - 1) % POSTER_POOL.length];
      const genres = GENRE_SETS[(i - 1) % GENRE_SETS.length];
      const formats = FORMAT_SETS[(i - 1) % FORMAT_SETS.length];
      const director = DIRECTORS[(i - 1) % DIRECTORS.length];

      movies.push({
        id: `mov-catalog-${String(i).padStart(3, "0")}`,
        is_active: true,
        created_at: now,
        created_by: "seeder-100",
        is_deleted: false,
        slug,
        title,
        tagline: `Experience ${title} in calibrated 3D spatial acoustics.`,
        description: `${title} is presented in CineView's flagship auditoriums with precision-calibrated sightlines, laser projection, and multi-channel spatial sound.`,
        genres: JSON.stringify(genres),
        duration_minutes: 115 + (i % 60),
        rating: i % 3 === 0 ? "R" : "PG-13",
        language: i % 10 === 0 ? "Japanese" : "English",
        release_date: i % 5 === 0 ? "2027-01-15" : "2026-11-10",
        status: i % 5 === 0 ? "coming_soon" : "now_showing",
        formats: JSON.stringify(formats),
        poster_url: poster,
        backdrop_url: poster,
        trailer_duration: "2:20",
        trailer_youtube_id: "Way9Dexny3w",
        director,
        cast: JSON.stringify([
          { name: "Lead Performer", role: "Protagonist" },
          { name: "Supporting Cast", role: "Navigator" },
        ]),
        popularity_score: Math.max(50, 96 - (i % 45)),
        recommended: i <= 12,
      });
    }

    await queryInterface.bulkInsert("movies", movies);
  },

  async down(queryInterface) {
    const ids = Array.from({ length: 98 }, (_, idx) => `mov-catalog-${String(idx + 1).padStart(3, "0")}`);
    await queryInterface.bulkDelete("movies", { id: ids }, {});
  },
};
