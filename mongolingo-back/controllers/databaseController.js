const mongoose = require("mongoose");
const BSON = require("bson");

/**
 * Nettoie les résultats en supprimant le champ __v et en convertissant les _id en string
 * @param {Array} results - Tableau de documents MongoDB
 * @returns {Array} - Tableau nettoyé
 */
function cleanResults(results) {
  return results.map((doc) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    delete obj.__v;
    if (obj._id) {
      obj._id = obj._id.toString();
    }
    return obj;
  });
}

const databaseController = {
  /**
   * Retourne les schémas de toutes les collections MongoDB
   * Exclut les collections Level et Question
   * @res {Object} - Objet avec les noms de collections comme clés et leur structure comme valeurs
   */
  async getAllSchemas(req, res) {
    try {
      const modelNames = mongoose.modelNames();
      const allSchemas = {};

      // Collections à exclure
      const excludedModels = ["Level", "Question"];
      const filteredModelNames = modelNames.filter(
        (name) => !excludedModels.includes(name),
      );

      // Parcourt chaque modèle pour extraire sa structure
      filteredModelNames.forEach((name) => {
        const paths = mongoose.model(name).schema.paths;
        const structure = {};

        Object.keys(paths).forEach((path) => {
          // Exclut les champs système
          if (path !== "_id" && path !== "__v") {
            // Gère les champs imbriqués (notation dot: "address.city")
            const parts = path.split(".");
            let current = structure;

            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];

              if (i === parts.length - 1) {
                // Dernier segment: enregistre le type
                current[part] = {
                  type: paths[path].instance,
                  required: !!paths[path].options.required,
                };
              } else {
                // Segment intermédiaire: crée l'objet imbriqué
                if (!current[part]) {
                  current[part] = {};
                }
                current = current[part];
              }
            }
          }
        });
        allSchemas[name] = structure;
      });

      res.json(allSchemas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Exporte les données des collections en JSON ou BSON
   * @req.query.format - Format d'export ('json' ou 'bson')
   * @res - Données exportées ou fichier BSON
   */
  async exportAll(req, res) {
    try {
      const modelNames = mongoose.modelNames();
      const backup = {};

      // Collections à exclure
      const excludedModels = ["Level", "Question"];
      const filteredModelNames = modelNames.filter(
        (name) => !excludedModels.includes(name),
      );

      // Récupère les données de chaque collection
      for (const name of filteredModelNames) {
        const results = await mongoose.model(name).find({});
        backup[name] = cleanResults(results);
      }

      // Retourne au format demandé
      if (req.query.format === "bson") {
        const bsonData = BSON.serialize(backup);
        res.setHeader("Content-Type", "application/octet-stream");
        return res.send(bsonData);
      }

      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Importe des données dans les collections
   * Supprime d'abord les données existantes puis insère les nouvelles
   * @req.body - Données à importer
   * @res {message} - Confirmation de l'import
   */
  async importAll(req, res) {
    try {
      const data = req.body;
      const excludedModels = ["Level", "Question"];
      const results = [];

      const modelNames = mongoose.modelNames();

      // Parcourt chaque collection à importer
      for (const [modelName, docs] of Object.entries(data)) {
        // Trouve le modèle Mongoose correspondant
        const mongooseModelName = modelNames.find(
          (name) =>
            name.toLowerCase() === modelName.toLowerCase() ||
            name.toLowerCase() + "s" === modelName.toLowerCase(),
        );

        // Ignore les modèles exclus ou non trouvés
        if (!mongooseModelName || excludedModels.includes(mongooseModelName))
          continue;

        const Model = mongoose.model(mongooseModelName);

        // Supprime tous les documents existants
        await Model.deleteMany({});

        // Ajoute les nouveaux documents
        if (Array.isArray(docs) && docs.length > 0) {
          await Model.insertMany(docs, { ordered: false });
        }

        results.push(mongooseModelName);
      }

      res.json({
        message: `Import réussi pour : ${results.join(", ")}`,
      });
    } catch (error) {
      console.error("Erreur import détaillée:", error);
      res.status(500).json({
        error: "Erreur de connexion à la base de données. Réessayez.",
      });
    }
  },

  /**
   * Exécute une requête MongoDB
   * @req.body {collection, query, projection, options}
   * @res {collection, count, results}
   */
  async executeQuery(req, res) {
    try {
      const {
        collection,
        query = {},
        projection = {},
        options = {},
      } = req.body;

      if (!collection) {
        return res.status(400).json({ error: "Collection requise" });
      }

      // Trouve le modèle correspondant à la collection
      const modelNames = mongoose.modelNames();
      const modelName = modelNames.find(
        (name) =>
          name.toLowerCase() === collection.toLowerCase() ||
          name.toLowerCase() + "s" === collection.toLowerCase(),
      );

      if (!modelName) {
        return res.status(404).json({
          error: `Collection '${collection}' non trouvée`,
          available: modelNames.filter(
            (n) => !["Level", "Question"].includes(n),
          ),
        });
      }

      const Model = mongoose.model(modelName);
      const results = await Model.find(query, projection, options);

      res.json({
        collection: modelName,
        count: results.length,
        results: cleanResults(results),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Exécute une solution de requête MongoDB (pour valider les réponses du quiz)
   * Supporte les méthodes: find, aggregate, countDocuments, distinct
   * @req.body {collection, method, query, projection, pipeline}
   * @res {collection, count, results}
   */
  async executeSolution(req, res) {
    try {
      const {
        collection,
        pipeline = null,
        query = null,
        projection = null,
        method = "find",
      } = req.body;

      if (!collection) {
        return res.status(400).json({ error: "Collection requise" });
      }

      // Trouve le modèle correspondant
      const modelNames = mongoose.modelNames();
      const modelName = modelNames.find(
        (name) =>
          name.toLowerCase() === collection.toLowerCase() ||
          name.toLowerCase() + "s" === collection.toLowerCase(),
      );

      if (!modelName) {
        return res.status(404).json({
          error: `Collection '${collection}' non trouvée`,
          available: modelNames.filter(
            (n) => !["Level", "Question"].includes(n),
          ),
        });
      }

      const Model = mongoose.model(modelName);
      let results;

      // Exécute la méthode appropriée
      if (method === "aggregate" && pipeline) {
        results = await Model.aggregate(pipeline);
      } else if (method === "countDocuments" && query) {
        const count = await Model.countDocuments(query);
        return res.json({
          collection: modelName,
          count: 1,
          results: [{ count }],
        });
      } else if (method === "distinct" && query) {
        const distinctValues = await Model.distinct(query);
        return res.json({
          collection: modelName,
          count: distinctValues.length,
          results: distinctValues.map((v) => ({ value: v })),
        });
      } else if (query) {
        results = await Model.find(query, projection);
      } else {
        results = await Model.find({}, projection);
      }

      res.json({
        collection: modelName,
        count: results.length,
        results: cleanResults(results),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = databaseController;
