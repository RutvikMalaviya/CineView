# CineView Backend

Production-oriented Express + TypeScript + PostgreSQL (Sequelize) + Redis backend for **CineView** (_Choose Your Seat. Experience Your View._).

## Setup

1. Start PostgreSQL, Redis, and Mailpit from the root `CineView/` directory:
   ```bash
   docker compose up -d
   ```
2. Copy `.env.example` to `.env` and fill in secrets:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and run checks:
   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm test
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
