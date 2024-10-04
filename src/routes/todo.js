require("dotenv").config({ path: "./src/.env" });
const express = require("express");
const router = express.Router();

const DBModules = require("../db/data.js");
const DB = DBModules.connectToDb("./src/db/database.db", "Connected to SQLite Database");

const { auth } = require("../middlewares/auth");

const { createTodo } = require("../controller/createTodo");
const { getTodos } = require("../controller/getTodos");
const { updateTodo } = require("../controller/updateTodo");
const { deleteTodo } = require("../controller/deleteTodo");

router.post("/todos", auth, (req, res) => { createTodo(req, res, DB) });
router.put("/todos/:id", auth, (req, res) => { updateTodo(req, res, DB) });

router.delete("/todos/:id", (req, res) => {
	const todoId = req.params.id;
	res.send(`Delete Todo Item (ID: ${todoId})\n`);
});

router.get("/todos", auth, (req, res) => { getTodos(req, res, DB) });

module.exports = router;
