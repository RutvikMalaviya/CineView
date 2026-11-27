# CineView Database Design (PostgreSQL + Sequelize)

## Global Conventions
- Primary keys: `VARCHAR(40)` UUIDv4.
- Audit & soft-delete columns on every table: `is_active`, `is_deleted`, `created_at` (`BIGINT` Unix seconds), `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`.
- All queries MUST filter `is_deleted = false`.
- All schema changes use versioned Sequelize migrations in `src/db/migrations/` (never `sync({ alter: true })`).

## Planned Core Tables
- **Auth & Users:** `users`, `email_verifications`, `password_resets`, `user_saved_cinemas` (sessions stored in Redis).
- **Catalog:** `movies`, `genres`, `movie_genres`, `cinemas`, `cinema_admins`.
- **3D Auditorium Geometry:** `auditoriums` (`screen_width`, `screen_height`, `screen_position`, `screen_curve_radius`, `speaker_count`, `acoustic_profile`), `auditorium_rows` (`row_label`, `seat_count`, `aisle_after_seats`, `category`, `price_multiplier`, `elevation_y`, `z_offset`), `seats` (`position_x/y/z`, `orientation_rad`).
- **Scheduling & Reservations:** `showtimes`, `seat_reservations` (unique partial index on `(showtime_id, seat_id) WHERE status IN ('RESERVED', 'CONFIRMED')`).
- **Commerce & Tickets:** `offers`, `concessions`, `bookings`, `booking_seats`, `booking_concessions`, `payments`, `payment_webhook_events`, `tickets`, `reviews`, `notifications`, `audit_logs`.
