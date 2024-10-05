const DBModules = require("../db/data.js");
const { getInfoOnJWT } = require("../services/getInfoOnJWT");

function getTodos(req, res, DB){
	const { page, limit } = req.query;

	const token = req.headers.authorization;

	const username = getInfoOnJWT(token, "username");

	let object = { data: [], "page": parseInt(page), "limit": parseInt(limit)};

	async function getTodosFromDB() {
		try {
			const rows = await DBModules.queryMultipleTable(
				DB, 
				"todos", 
				["*"], 
				[{ "row": "byUser", "value": username }]
			);
			rows.map(row => object.data.push(row));
			object.total = rows.length;
			res.status(200).send(JSON.stringify(object, undefined, 2) + '\n');
			return;
		} catch (err) {
			const message = {"message": "Malformed Request", "err": err.message}
			res.status(400).send(JSON.stringify(message)+'\n');
			return;
		}
	}
	getTodosFromDB();
}

module.exports = { getTodos };
