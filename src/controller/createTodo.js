require("dotenv").config({ path: "../.env" })

const DBModules = require("../db/data");
const { getInfoOnJWT } = require("../services/getInfoOnJWT");

function createTodo(req, res, DB) {
	const { title, description } = req.body;
	if (title === undefined || description === undefined) {
		res.send("Creating Todo Failed: Title or description Empty\n");
		return;
	}
	const token = req.headers.authorization;

	const username = getInfoOnJWT(token, "username");

	async function insertTodoOnDB(){
		try {
			DB.serialize(async() => {
				DBModules.createTable(
					DB, "todos", true, `
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						title TEXT NOT NULL,
						description TEXT NOT NULL,
						byUser TEXT NOT NULL
				`);

				const taskExists = await DBModules.queryTable(
					DB, 
					"todos", 
					["title", "byUser"], 
					[
						{"row": "title", "value": title},
						{"row": "byUser", "value": username}
					]
				);

				if (taskExists) {
					res.status(400).send("Task Already Exists\n");
					return;
				}

				DBModules.insertTable(
					DB,
					"todos",
					["title", "description", "byUser"],
					[title, description, username]
				);
				console.log(DBModules.queryAllTable(DB, "todos"));
				const row = await DBModules.queryTable(
					DB, 
					"todos", 
					["id", "title", "description"], 
					[{ "row": "title", "value": title }]
				);
				res.status(201).send(`Created Row: ${JSON.stringify(row)}\n`);
			})
		} catch(err) {
			const message = {"message": "Malformed Request", "err": err.message}
			res.status(400).send(JSON.stringify(message)+'\n');
			return;
		}
	}
	insertTodoOnDB();
}

module.exports = { createTodo };
