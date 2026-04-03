const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

router.get(
  "/question/:levelId/:questionId",
  questionController.getQuestionById,
);

router.get("/count/:levelId", questionController.getQuestionCountByLevel);

module.exports = router;
