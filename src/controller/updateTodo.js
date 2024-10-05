const DBModules = require("../db/data");
const { getInfoOnJWT } = require("../services/getInfoOnJWT");

function updateTodo(req, res, DB) {
	const todoId = req.params.id;
	const token = req.headers.authorization;
	const username = getInfoOnJWT(token, "username");

	const { title, description } = req.body;

	async function updateTodoFromDB() {
		DB.serialize(async() => {
			try {
				const row = await DBModules.queryTable(
					DB, 
					"todos", 
					["*"], 
					[
						{ "row": "id", "value": todoId },
						{ "row": "byUser", "value": username }
					]
				).catch((err) => { throw new Error("Forbidden") });
				const object = {
					"title": title || row.title, 
					"description": description || row.description
				};
				const updateChanges = await DBModules.updateTable(
					DB, 
					"todos", 
					[
						{"row":"title", "newValue":`"${object.title}"`},
						{"row":"description", "newValue":`"${object.description}"`}
					],
					[{"row": "id", "value": todoId}]
				).catch((err) => { throw new Error("Update Failed") });
				const updatedRow = await DBModules.queryTable(
					DB, 
					"todos", 
					["*"], 
					[
						{ "row": "id", "value": todoId },
						{ "row": "byUser", "value": username }
					]
				).catch((err) => { throw new Error("Update Failed") });
				console.log("\nRows Changed: ", updatedRow, '\n');

				const updatedRowString = JSON.stringify(updatedRow, undefined, 2);
				res.status(200).send(updatedRowString + '\n');
				return;

			} catch (err) {
				const message = {"message": err.message}
				res.status(400).send(JSON.stringify(message)+'\n');
				return;
			}
		})
	}
	updateTodoFromDB();
}

module.exports = { updateTodo };
