const express = require("express");
const router = express.Router();
const databaseController = require("../controllers/databaseController");

router.get("/schemas", databaseController.getAllSchemas);

router.get("/export", databaseController.exportAll);

router.get("/export/:modelName", databaseController.exportAll);

router.post("/import", databaseController.importAll);

router.post("/import/:modelName", databaseController.importAll);

router.post("/query", databaseController.executeQuery);

router.post("/execute-solution", databaseController.executeSolution);

module.exports = router;
