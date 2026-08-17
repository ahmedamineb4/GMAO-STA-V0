import { neon } from "@neondatabase/serverless";

let isSchemaInitialized = false;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "") {
    return null;
  }
  return neon(connectionString.trim());
}

export async function initNeonSchema() {
  const sql = getDb();
  if (!sql) return false;
  if (isSchemaInitialized) return true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gmao_store (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    isSchemaInitialized = true;
    return true;
  } catch (error) {
    console.error("[NEON DB] Erreur d'initialisation du schéma :", error);
    throw error;
  }
}

export async function checkNeonConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      configured: false,
      connected: false,
      message: "DATABASE_URL n'est pas définie dans l'environnement."
    };
  }

  try {
    const sql = getDb();
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    await initNeonSchema();
    
    // Mask password in DB URL for security
    let maskedUrl = connectionString;
    try {
      const parsed = new URL(connectionString);
      if (parsed.password) {
        parsed.password = "******";
      }
      maskedUrl = parsed.toString();
    } catch (e) {
      maskedUrl = connectionString.replace(/:([^@]+)@/, ":******@");
    }

    return {
      configured: true,
      connected: true,
      serverTime: result[0]?.current_time,
      pgVersion: result[0]?.pg_version,
      databaseUrlMasked: maskedUrl,
      message: "Connecté avec succès à Neon PostgreSQL !"
    };
  } catch (error) {
    console.error("[NEON DB] Test de connexion échoué :", error);
    return {
      configured: true,
      connected: false,
      error: error?.message || "Erreur de connexion à Neon PostgreSQL",
      message: "Impossible de joindre la base de données Neon. Vérifiez DATABASE_URL."
    };
  }
}

export async function loadAllDataFromNeon() {
  const sql = getDb();
  if (!sql) return null;

  await initNeonSchema();
  const rows = await sql`SELECT key, data FROM gmao_store`;
  if (!rows || rows.length === 0) {
    return null;
  }

  const result = {};
  for (const row of rows) {
    result[row.key] = row.data;
  }
  return result;
}

export async function saveAllDataToNeon(payload) {
  const sql = getDb();
  if (!sql) return false;

  await initNeonSchema();

  const keys = Object.keys(payload);
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) {
      const jsonString = JSON.stringify(payload[key]);
      await sql`
        INSERT INTO gmao_store (key, data, updated_at)
        VALUES (${key}, ${jsonString}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
      `;
    }
  }

  return true;
}
