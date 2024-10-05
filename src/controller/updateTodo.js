const DBModules = require("../db/data");
const { getInfoOnJWT } = require("../services/getInfoOnJWT");

function updateTodo(req, res, DB) {
	const todoId = req.params.id;
	const token = req.headers.authorization;
	const username = getInfoOnJWT(token, "username");

	const { title, description } = req.body;

	async function updateTodoFromDB() {
		try {
			DB.serialize(async() => {
				const row = await DBModules.queryTable(
					DB, 
					"todos", 
					["*"], 
					[
						{ "row": "id", "value": todoId },
						{ "row": "byUser", "value": username }
					]
				);
				if (row === undefined) {
					const message = {"message": "Forbidden"};
					res.status(403).send(JSON.stringify(message)+'\n');
					return;
				}
				const object = {
					"title": title || row.title, 
					"description": description || row.description
				};
				DBModules.updateTable(
					DB, 
					"todos", 
					[
						{"row": "title", "newValue": `"${object.title}"`},
						{"row": "description", "newValue": `"${object.description}"`}
					],
					[
						{"row": "id", "value": todoId},
					]
				);
				const updatedRow = await DBModules.queryTable(
					DB, 
					"todos", 
					["*"], 
					[
						{ "row": "id", "value": todoId },
						{ "row": "byUser", "value": username }
					]
				);
				res.status(200).send(JSON.stringify(updatedRow, undefined, 2) + '\n');
				return;

			})
		} catch (err) {
			const message = {"message": "Malformed Request", "err": err.message}
			res.status(400).send(JSON.stringify(message)+'\n');
			return;
		}
	}
	updateTodoFromDB();
}

module.exports = { updateTodo };
