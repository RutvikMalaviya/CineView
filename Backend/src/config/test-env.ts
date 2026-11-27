process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "4001";
process.env.DB_NAME = process.env.DB_NAME || "cineview_test";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || "test_only_session_secret_at_least_32_chars_long";
process.env.CSRF_SECRET =
  process.env.CSRF_SECRET || "test_only_csrf_secret_at_least_32_chars_long";
process.env.CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000";
process.env.LOG_LEVEL = "silent";
