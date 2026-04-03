const API_URL = import.meta.env.VITE_API_URL;

export type QueryResult = {
  collection: string;
  count: number;      
  results: any[];    
};

/**
 * Récupère les schémas de toutes les collections MongoDB
 * @returns Les schémas des collections
 */
export const getAllSchemas = async () => {
  const res = await fetch(`${API_URL}/database/schemas`);
  return res.json();
};

/**
 * Exporte les données d'une collection dans le format spécifié
 * @param modelName - Nom de la collection à exporter
 * @param format - Format d'export ('json' ou 'bson')
 * @returns Les données exportées
 */
export const exportData = async (modelName: string, format: "json" | "bson") => {
  const res = await fetch(`${API_URL}/database/export/${modelName}?format=${format}`);
  return format === "bson" ? res.arrayBuffer() : res.json();
};

/**
 * Importe des données dans une collection
 * @param modelName - Nom de la collection cible
 * @param data - Données à importer
 * @param isBson - Indique si les données sont au format BSON
 * @returns Le résultat de l'import
 */
export const importData = async (modelName: string, data: any, isBson: boolean) => {
  return fetch(`${API_URL}/database/import/${modelName}`, {
    method: "POST",
    headers: { "Content-Type": isBson ? "application/octet-stream" : "application/json" },
    body: isBson ? data : JSON.stringify(data),
  });
};

/**
 * Exécute une solution de requête MongoDB
 * Parse la requête et l'envoie au backend pour exécution
 * @param solution - Requête MongoDB à exécuter (format: db.collection.method())
 * @returns Les résultats de la requête
 */
export const executeSolution = async (solution: string): Promise<QueryResult> => {
  const parsed = parseMongoQuery(solution);
  const res = await fetch(`${API_URL}/database/execute-solution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });
  return res.json();
};

/**
 * Parse une requête MongoDB en format texte pour en extraire les composantes
 * Supporte: find, aggregate, countDocuments, distinct, updateOne, updateMany, deleteOne, deleteMany
 * @param query - Requête MongoDB au format texte
 * @returns Objet avec collection, method, query, projection et optionnellement pipeline
 */
function parseMongoQuery(query: string): { collection: string; method: string; query?: object | string; projection?: object; pipeline?: object[] } {
  const trimmed = query.trim();

  /**
   * Convertit une chaîne MongoDB en JSON valide
   * Ex: "{ name: 1 }" -> "{ \"name\": 1 }"
   */
  function mongoToJson(str: string): string {
    // Entoure les clés non quotées de guillemets
    return str.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  }

  // Parse les requêtes aggregate
  const aggregateMatch = trimmed.match(/^db\.(\w+)\.aggregate\(\[(.+)\]\)$/s);
  if (aggregateMatch) {
    const collection = aggregateMatch[1];
    const pipelineStr = aggregateMatch[2];
    return {
      collection,
      method: "aggregate",
      pipeline: JSON.parse(`[${pipelineStr}]`),
    };
  }

  // Parse les requêtes countDocuments
  const countMatch = trimmed.match(/^db\.(\w+)\.countDocuments\((.*)\)$/s);
  if (countMatch) {
    const collection = countMatch[1];
    const queryStr = countMatch[2].trim();
    try {
      return {
        collection,
        method: "countDocuments",
        query: queryStr ? JSON.parse(mongoToJson(queryStr)) : {},
      };
    } catch {
      return { collection, method: "countDocuments", query: {} };
    }
  }

  // Parse les requêtes distinct
  const distinctMatch = trimmed.match(/^db\.(\w+)\.distinct\("(\w+)"\)$/);
  if (distinctMatch) {
    const collection = distinctMatch[1];
    const field = distinctMatch[2];
    return {
      collection,
      method: "distinct",
      query: field,
    };
  }

  // Parse les requêtes update/delete
  const updateMatch = trimmed.match(/^db\.(\w+)\.(updateMany|updateOne|deleteMany|deleteOne)\((.+)\)$/s);
  if (updateMatch) {
    return {
      collection: updateMatch[1],
      method: updateMatch[2],
    };
  }

  // Parse les requêtes find avec projection et options
  const findMatch = trimmed.match(/^db\.(\w+)\.find\(([^)]+)\)(?:\.sort\(([^)]+)\))?(?:\.limit\((\d+)\))?$/s);
  if (findMatch) {
    const collection = findMatch[1];
    const argsStr = findMatch[2].trim();

    // Parse les arguments en extrayant les objets JSON correctement
    let queryObj = {};
    let projectionObj: object | undefined = undefined;

    try {
      // Cherche le premier objet JSON (la query)
      const queryMatch = argsStr.match(/^(\{[^}]*\})/);
      if (queryMatch) {
        queryObj = JSON.parse(mongoToJson(queryMatch[1]));
      }

      // Cherche le deuxième objet JSON (la projection) qui suit la virgule
      const afterQuery = argsStr.substring(argsStr.indexOf('}') + 1).trim();
      if (afterQuery.startsWith(',')) {
        const projectionMatch = afterQuery.substring(1).trim().match(/^(\{[^}]*\})/);
        if (projectionMatch) {
          projectionObj = JSON.parse(mongoToJson(projectionMatch[1]));
        }
      }
    } catch (e) {
      console.error("Erreur parsing find:", e);
    }

    return {
      collection,
      method: "find",
      query: queryObj,
      projection: projectionObj,
    };
  }

  // Par défaut, retourne une requête find simple
  return { collection: trimmed, method: "find" };
}
