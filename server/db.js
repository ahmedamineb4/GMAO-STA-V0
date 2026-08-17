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

    // Automatically create / update convenient relational SQL views for quick inspection in Neon
    try {
      await sql`
        CREATE OR REPLACE VIEW vue_equipements AS
        SELECT 
          elem->>'id' AS id,
          elem->>'name' AS nom,
          elem->>'code' AS code,
          elem->>'workshop' AS atelier,
          elem->>'category' AS categorie,
          elem->>'location' AS emplacement,
          elem->>'status' AS statut,
          elem->>'critical' AS criticite,
          elem->>'brand' AS marque,
          elem->>'model' AS modele,
          elem->>'serialNumber' AS numero_serie,
          elem->>'commissioningDate' AS date_mise_en_service
        FROM gmao_store, jsonb_array_elements(data) AS elem
        WHERE key = 'equipments';
      `;

      await sql`
        CREATE OR REPLACE VIEW vue_interventions AS
        SELECT 
          elem->>'id' AS id,
          elem->>'title' AS titre,
          elem->>'equipmentCode' AS code_equipement,
          elem->>'type' AS type,
          elem->>'priority' AS priorite,
          elem->>'status' AS statut,
          elem->>'technician' AS technicien,
          elem->>'dateIntervention' AS date_intervention,
          elem->>'description' AS description
        FROM gmao_store, jsonb_array_elements(data) AS elem
        WHERE key = 'interventions';
      `;

      await sql`
        CREATE OR REPLACE VIEW vue_alertes AS
        SELECT 
          'EQUIPEMENT EN PANNE' AS type_alerte,
          elem->>'code' AS code,
          elem->>'name' AS designation,
          elem->>'workshop' AS atelier,
          elem->>'status' AS statut,
          elem->>'critical' AS criticite
        FROM gmao_store, jsonb_array_elements(data) AS elem
        WHERE key = 'equipments' AND elem->>'status' IN ('En Panne', 'Hors Service', 'Dégradé')
        UNION ALL
        SELECT 
          'INTERVENTION CRITIQUE' AS type_alerte,
          elem->>'equipmentCode' AS code,
          elem->>'title' AS designation,
          elem->>'technician' AS atelier,
          elem->>'status' AS statut,
          elem->>'priority' AS criticite
        FROM gmao_store, jsonb_array_elements(data) AS elem
        WHERE key = 'interventions' AND elem->>'priority' IN ('Critique', 'Haute', 'Urgente');
      `;
    } catch (viewErr) {
      console.warn("[NEON DB] Note lors de la création des vues SQL:", viewErr?.message);
    }

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

    // Inspect content of gmao_store
    let storeSummary = {};
    let totalKeys = 0;
    try {
      const rows = await sql`
        SELECT key, 
               CASE 
                 WHEN jsonb_typeof(data) = 'array' THEN jsonb_array_length(data)
                 ELSE 1 
               END as count,
               updated_at
        FROM gmao_store
      `;
      totalKeys = rows.length;
      for (const row of rows) {
        storeSummary[row.key] = {
          count: parseInt(row.count, 10) || 1,
          updatedAt: row.updated_at
        };
      }
    } catch (e) {
      console.warn("[NEON DB] Could not read store summary:", e);
    }

    return {
      configured: true,
      connected: true,
      serverTime: result[0]?.current_time,
      pgVersion: result[0]?.pg_version,
      databaseUrlMasked: maskedUrl,
      totalKeys,
      storeSummary,
      message: totalKeys > 0 
        ? `Connecté à Neon PostgreSQL (${totalKeys} modules enregistrés)`
        : "Connecté à Neon PostgreSQL (Base prête, en attente de la première synchronisation)"
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
