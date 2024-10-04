const DBModules = require("../db/data.js");
const { verifyJWT } = require("../services/verifyJWT");

function getTodos(req, res, DB){
	const { page, limit } = req.query;

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
