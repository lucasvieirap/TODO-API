const DBModules = require("../db/data");
const { verifyJWT } = require("../services/verifyJWT");

function updateTodo(req, res, DB) {
	const todoId = req.params.id;
	const token = req.headers.authorization;

	const tokenString = token.toString();
	const jwt_secret = process.env.SECRET_JWT;
	const options = { expiresIn: "15m" };

	const verifiedToken = verifyJWT(tokenString, options, jwt_secret);
	const verifiedTokenString = JSON.stringify(verifiedToken);

	if (!verifiedToken) {
		res.status(401).send(JSON.stringify({"message": "Unauthorized"}));
		return;
	}

	const username = verifiedToken?.token?.username;
	if (!username) {
		res.status(401).send("Error on Validation of Token\n");
		return;
	}

	console.log(`Token Verification Successful:`);
	console.log(`VerifiedToken: ${verifiedTokenString}`);
	console.log(`By User: ${username}`);

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
