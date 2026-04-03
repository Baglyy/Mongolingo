const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

router.get("/", levelController.getAllLevels);

router.put("/:levelId", levelController.updateLevel);

module.exports = router;
