import postgres from "postgres";

declare global {
  var __sibillaSql: ReturnType<typeof postgres> | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

export const sql =
  global.__sibillaSql ??
  postgres(getDatabaseUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.__sibillaSql = sql;
}
