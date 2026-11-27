"use strict";

const argon2 = require("argon2");
const crypto = require("crypto");

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

    const customerHash = await argon2.hash("DemoUser123!", { type: argon2.argon2id });
    const cinemaAdminHash = await argon2.hash("CinemaAdmin123!", { type: argon2.argon2id });
    const adminHash = await argon2.hash("AdminUser123!", { type: argon2.argon2id });

    await queryInterface.bulkInsert("users", [
      {
        ...audit,
        id: "usr-demo-alex",
        name: "Alex Rivera",
        email: "alex.rivera@cineview.app",
        password_hash: customerHash,
        role: "CUSTOMER",
        email_verified: true,
        phone: "+1 (310) 555-0194",
        city: "Los Angeles",
        tier: "Director's Circle • VIP",
        points: 2480,
        preferred_format: "IMAX with Laser",
        preferred_row_zone: "center",
        accessibility_needs: false,
        saved_cinema_ids: JSON.stringify(["cin-premiere-dome", "cin-sunset-suites"]),
        notifications: JSON.stringify({
          showtimeAlerts: true,
          premiereInvites: true,
          smsTicketUpdates: false,
        }),
      },
      {
        ...audit,
        id: "usr-cinema-admin",
        name: "Maya Lin (Premiere Dome)",
        email: "cinema.admin@cineview.app",
        password_hash: cinemaAdminHash,
        role: "CINEMA_ADMIN",
        email_verified: true,
        phone: "+1 (310) 555-0150",
        city: "Los Angeles",
        tier: "Cinema Admin",
        points: 0,
        preferred_format: "IMAX with Laser",
        preferred_row_zone: "center",
        accessibility_needs: false,
        saved_cinema_ids: JSON.stringify(["cin-premiere-dome"]),
        notifications: JSON.stringify({
          showtimeAlerts: true,
          premiereInvites: false,
          smsTicketUpdates: true,
        }),
      },
      {
        ...audit,
        id: "usr-admin-super",
        name: "CineView Operations",
        email: "admin@cineview.app",
        password_hash: adminHash,
        role: "SUPER_ADMIN",
        email_verified: true,
        phone: "+1 (310) 555-0100",
        city: "Los Angeles",
        tier: "Operations",
        points: 0,
        preferred_format: "IMAX with Laser",
        preferred_row_zone: "center",
        accessibility_needs: false,
        saved_cinema_ids: JSON.stringify([]),
        notifications: JSON.stringify({
          showtimeAlerts: true,
          premiereInvites: true,
          smsTicketUpdates: true,
        }),
      },
    ]);

    await queryInterface.bulkInsert("movies", [
      {
        ...audit,
        id: "mov-dune-part-two",
        slug: "dune-part-two",
        title: "Dune: Part Two",
        tagline: "Long live the fighters.",
        description:
          "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genres: JSON.stringify(["Sci-Fi", "Adventure", "Drama"]),
        duration_minutes: 166,
        rating: "PG-13",
        language: "English",
        release_date: "2024-03-01",
        status: "now_showing",
        formats: JSON.stringify(["IMAX with Laser", "Dolby Cinema", "Standard 2D"]),
        poster_url: "/images/posters/dune-part-two.jpg",
        backdrop_url: "/images/posters/dune-part-two.jpg",
        trailer_duration: "2:28",
        trailer_youtube_id: "Way9Dexny3w",
        director: "Denis Villeneuve",
        cast: JSON.stringify([
          { name: "Timothée Chalamet", role: "Paul Atreides" },
          { name: "Zendaya", role: "Chani" },
        ]),
        popularity_score: 98,
        recommended: true,
      },
      {
        ...audit,
        id: "mov-interstellar",
        slug: "interstellar",
        title: "Interstellar",
        tagline: "Mankind was born on Earth. It was never meant to die here.",
        description:
          "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        genres: JSON.stringify(["Sci-Fi", "Drama", "Adventure"]),
        duration_minutes: 169,
        rating: "PG-13",
        language: "English",
        release_date: "2014-11-07",
        status: "now_showing",
        formats: JSON.stringify(["70mm Film", "IMAX with Laser"]),
        poster_url: "/images/posters/interstellar.jpg",
        backdrop_url: "/images/posters/interstellar.jpg",
        trailer_duration: "2:33",
        trailer_youtube_id: "zSWdZVtXT7E",
        director: "Christopher Nolan",
        cast: JSON.stringify([
          { name: "Matthew McConaughey", role: "Cooper" },
          { name: "Anne Hathaway", role: "Brand" },
        ]),
        popularity_score: 95,
        recommended: true,
      },
    ]);

    await queryInterface.bulkInsert("cinemas", [
      {
        ...audit,
        id: "cin-premiere-dome",
        name: "CineView Premiere Dome - Downtown Flagship",
        tier: "Flagship IMAX GT",
        city: "Los Angeles",
        address: "800 W Olympic Blvd, Los Angeles, CA 90015",
        distance_miles: 1.2,
        facilities: JSON.stringify(["IMAX with Laser", "Dolby Atmos", "Valet Parking", "Lounge"]),
        image_url: "/images/cinemas/premiere-dome.svg",
        parking_info: "Validated underground garage via West Atrium entrance.",
        admin_user_id: "usr-cinema-admin",
      },
      {
        ...audit,
        id: "cin-sunset-suites",
        name: "CineView Sunset Boulevard & Recliner Suites",
        tier: "Director's Lounge",
        city: "Los Angeles",
        address: "8000 Sunset Blvd, West Hollywood, CA 90046",
        distance_miles: 4.5,
        facilities: JSON.stringify(["70mm Film", "Dine-In Recliners", "Cocktail Bar"]),
        image_url: "/images/cinemas/sunset-suites.svg",
        parking_info: "Complimentary 3-hour structure parking.",
        admin_user_id: "usr-admin-super",
      },
      {
        ...audit,
        id: "cin-century-pavilion",
        name: "CineView Century City Tech Pavilion",
        tier: "Experimental Pavilion • ScreenX 270°",
        city: "Los Angeles",
        address: "10250 Santa Monica Blvd, Century City, CA 90067",
        distance_miles: 5.8,
        facilities: JSON.stringify(["Dual 4K Barco Laser", "ScreenX 270° Surround", "Spatial Acoustic Pods"]),
        image_url: "/images/cinemas/century-pavilion.svg",
        parking_info: "Free 4-hour validated underground parking in Structure B.",
        admin_user_id: "usr-admin-super",
      },
    ]);

    const imaxRows = [
      { rowLabel: "A", seatCount: 12, aisleAfterSeats: [6], category: "standard", priceMultiplier: 1.0, elevationY: 0.4, zOffset: -3.5 },
      { rowLabel: "B", seatCount: 12, aisleAfterSeats: [6], category: "standard", priceMultiplier: 1.0, elevationY: 0.8, zOffset: -2.0 },
      { rowLabel: "C", seatCount: 14, aisleAfterSeats: [3, 11], category: "premium", priceMultiplier: 1.15, elevationY: 1.2, zOffset: -0.5 },
      { rowLabel: "D", seatCount: 14, aisleAfterSeats: [3, 11], category: "premium", priceMultiplier: 1.15, elevationY: 1.6, zOffset: 1.0 },
      { rowLabel: "E", seatCount: 14, aisleAfterSeats: [3, 11], category: "vip", priceMultiplier: 1.35, elevationY: 2.0, zOffset: 2.5 },
    ];

    const suiteRows = [
      { rowLabel: "A", seatCount: 8, aisleAfterSeats: [4], category: "vip", priceMultiplier: 1.5, elevationY: 0.5, zOffset: -2.0 },
      { rowLabel: "B", seatCount: 8, aisleAfterSeats: [4], category: "vip", priceMultiplier: 1.5, elevationY: 1.0, zOffset: 0.0 },
      { rowLabel: "C", seatCount: 8, aisleAfterSeats: [4], category: "vip", priceMultiplier: 1.5, elevationY: 1.5, zOffset: 2.0 },
    ];

    await queryInterface.bulkInsert("auditoriums", [
      {
        ...audit,
        id: "aud-imax-gt",
        cinema_id: "cin-premiere-dome",
        name: "Screen 1 • IMAX GT 70ft",
        format: "IMAX with Laser",
        screen_width: 26,
        screen_height: 19,
        screen_position: JSON.stringify([0, 6.5, -14]),
        screen_curve_radius: 48,
        speaker_count: 64,
        acoustic_profile: "IMAX 12-Channel Precision",
        rows: JSON.stringify(imaxRows),
        default_rows: JSON.stringify(imaxRows),
      },
      {
        ...audit,
        id: "aud-vip-suite",
        cinema_id: "cin-sunset-suites",
        name: "Suite A • Dine-In Recliner",
        format: "70mm Film",
        screen_width: 16,
        screen_height: 9,
        screen_position: JSON.stringify([0, 4.5, -10]),
        screen_curve_radius: 36,
        speaker_count: 24,
        acoustic_profile: "Dolby Atmos Boutique",
        rows: JSON.stringify(suiteRows),
        default_rows: JSON.stringify(suiteRows),
      },
    ]);

    await queryInterface.bulkInsert("offers", [
      {
        ...audit,
        id: "off-cine15",
        code: "CINE15",
        title: "15% Off IMAX & Dolby Pairings",
        description: "Save 15% on ticket subtotals when booking 2 or more seats.",
        discount_type: "percentage",
        discount_value: 15,
        min_tickets: 2,
        accent: "primary",
      },
      {
        ...audit,
        id: "off-vip10",
        code: "VIP10",
        title: "$10 Off Director's Lounge",
        description: "Instant $10 savings on bookings of 2 or more VIP recliner tickets.",
        discount_type: "fixed",
        discount_value: 10,
        min_tickets: 2,
        accent: "secondary",
      },
      {
        ...audit,
        id: "off-popcorn",
        code: "ARTISAN",
        title: "Complimentary Artisan Popcorn",
        description: "Unlocked automatically on Premiere Dome IMAX GT screenings with 2+ seats.",
        discount_type: "perk",
        discount_value: 0,
        min_tickets: 2,
        accent: "tertiary",
      },
    ]);

    await queryInterface.bulkInsert("concessions", [
      { ...audit, id: "con-popcorn", name: "Artisan Truffle Popcorn (Demo)", price: 9.5, category: "snack" },
      { ...audit, id: "con-lounge", name: "West Atrium Cocktail Lounge Pass", price: 14.0, category: "lounge" },
    ]);

    await queryInterface.bulkInsert("showtimes", [
      {
        ...audit,
        id: "st-dune-imax-1915",
        movie_id: "mov-dune-part-two",
        cinema_id: "cin-premiere-dome",
        auditorium_id: "aud-imax-gt",
        date: "2026-11-28",
        time: "19:15",
        format: "IMAX with Laser",
        language: "English",
        base_price: 22.0,
        total_seats: 66,
        badge: "Selling Fast",
      },
      {
        ...audit,
        id: "st-interstellar-vip-2130",
        movie_id: "mov-interstellar",
        cinema_id: "cin-sunset-suites",
        auditorium_id: "aud-vip-suite",
        date: "2026-11-28",
        time: "21:30",
        format: "70mm Film",
        language: "English",
        base_price: 26.0,
        total_seats: 24,
        badge: "Prime 70mm",
      },
    ]);

    await queryInterface.bulkInsert("bookings", [
      {
        ...audit,
        id: "bkg-demo-8472a",
        user_id: "usr-demo-alex",
        reference_code: "CV-2099-8472A",
        movie_id: "mov-dune-part-two",
        movie_title: "Dune: Part Two",
        poster_url: "/images/posters/dune-part-two.jpg",
        cinema_id: "cin-premiere-dome",
        cinema_name: "CineView Premiere Dome - Downtown Flagship",
        auditorium_id: "aud-imax-gt",
        auditorium_name: "Screen 1 • IMAX GT 70ft",
        showtime_id: "st-dune-imax-1915",
        format: "IMAX with Laser",
        date: "2026-11-28",
        time: "19:15",
        seats: JSON.stringify([
          { id: "E-7", label: "E-7", category: "vip", price: 29.7 },
          { id: "E-8", label: "E-8", category: "vip", price: 29.7 },
        ]),
        concessions: JSON.stringify([
          { id: "con-popcorn", name: "Artisan Truffle Popcorn (Demo)", price: 9.5, quantity: 1 },
        ]),
        offer_code: null,
        subtotal: 68.9,
        convenience_fee: 3.5,
        discount: 0,
        total: 72.4,
        status: "confirmed",
        payment_method_label: "Stripe Demo •••• 4242",
        contact_name: "Alex Rivera",
        contact_email: "alex.rivera@cineview.app",
      },
    ]);

    await queryInterface.bulkInsert("seat_reservations", [
      {
        ...audit,
        id: crypto.randomUUID(),
        reservation_group_id: "grp-seed-1",
        showtime_id: "st-dune-imax-1915",
        user_id: "usr-demo-alex",
        seat_label: "E-7",
        status: "CONFIRMED",
        expires_at: now + 86400,
      },
      {
        ...audit,
        id: crypto.randomUUID(),
        reservation_group_id: "grp-seed-1",
        showtime_id: "st-dune-imax-1915",
        user_id: "usr-demo-alex",
        seat_label: "E-8",
        status: "CONFIRMED",
        expires_at: now + 86400,
      },
    ]);

    await queryInterface.bulkInsert("tickets", [
      {
        ...audit,
        id: "tkt-demo-8472a",
        booking_id: "bkg-demo-8472a",
        user_id: "usr-demo-alex",
        reference_code: "CV-2099-8472A",
        gate: "WEST ATRIUM • LOUNGE ACCESS",
        qr_payload: "CINEVIEW|CV-2099-8472A|seeded",
        voucher_code: "SNACK-8472A",
        status: "VALID",
      },
    ]);

    await queryInterface.bulkInsert("reviews", [
      {
        ...audit,
        id: "rev-seed-1",
        movie_id: "mov-dune-part-two",
        user_id: "usr-demo-alex",
        rating: 5,
        comment: "Row E center in IMAX GT is perfection — huge FOV and crystal-clear bass.",
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("reviews", null, {});
    await queryInterface.bulkDelete("tickets", null, {});
    await queryInterface.bulkDelete("seat_reservations", null, {});
    await queryInterface.bulkDelete("bookings", null, {});
    await queryInterface.bulkDelete("showtimes", null, {});
    await queryInterface.bulkDelete("concessions", null, {});
    await queryInterface.bulkDelete("offers", null, {});
    await queryInterface.bulkDelete("auditoriums", null, {});
    await queryInterface.bulkDelete("cinemas", null, {});
    await queryInterface.bulkDelete("movies", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
