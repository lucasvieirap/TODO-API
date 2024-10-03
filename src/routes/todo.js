require("dotenv").config({ path: "./src/.env" });
const express = require("express");
const router = express.Router();

const DBModules = require("../db/data.js");
const DB = DBModules.connectToDb("./src/db/database.db", "Connected to SQLite Database");

const { auth } = require("../middlewares/auth");

const { createTodo } = require("../controller/createTodo");

router.post("/todos", auth, (req, res) => { createTodo(req, res, DB) });

router.get("/users", (req, res) => {
	const table = DBModules.queryAllTable(DB, "users");
	res.send(table);
});

router.put("/todos/:id", (req, res) => {
	const todoId = req.params.id;
	res.send(`Update Todo Item (ID: ${todoId})\n`);
});

router.delete("/todos/:id", (req, res) => {
	const todoId = req.params.id;
	res.send(`Delete Todo Item (ID: ${todoId})\n`);
});

router.get("/todos", (req, res) => {
	res.send("Return Todos\n");
});

module.exports = router;
