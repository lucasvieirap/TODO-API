const DBModules = require("../db/data");
const { getInfoOnJWT } = require("../services/getInfoOnJWT");

function deleteTodo(req, res, DB) {
	const todoId = req.params.id;
	const token = req.headers.authorization;

	const username = getInfoOnJWT(token, "username");

	async function deleteTodoFromDB() {
		try {
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
			DBModules.deleteTable(
				DB, 
				"todos",
				[
					{"row": "id", "value": todoId},
					{"row": "byUser", "value": `"${username}"` }
				]
			);
			console.log(DBModules.queryAllTable(DB, "todos"));
			res.status(204).send(JSON.stringify(row, undefined, 2) + '\n');
			return;
		} catch (err) {
			const message = {"message": "Malformed Request", "err": err.message}
			res.status(400).send(JSON.stringify(message)+'\n');
			return;
		}
	}
	deleteTodoFromDB();
};

module.exports = { deleteTodo };
