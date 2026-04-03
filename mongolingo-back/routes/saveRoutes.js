const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

router.post("/progress", saveController.saveProgress);

router.get("/progress/:sessionId", saveController.loadProgress);

router.get("/completed-levels/:sessionId", saveController.getCompletedLevels);

module.exports = router;
