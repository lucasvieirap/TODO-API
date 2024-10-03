require("dotenv").config({ path: "../.env" })

const DBModules = require("../db/data");
const { verifyJWT } = require("../services/verifyJWT");

function createTodo(req, res, DB) {
	const { title, description } = req.body;
	if (title === undefined || description === undefined) {
		res.send("Creating Todo Failed: Title or description Empty\n");
		return;
	}
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

	console.log(`Successful:`);
	console.log(`VerifiedToken: ${verifiedTokenString}`);
	console.log(`By User: ${username}`);
	
	try {
		DB.serialize(() => {
			DBModules._createTable(
				DB, "todos", true, `
					title TEXT NOT NULL,
					description TEXT NOT NULL,
					byUser TEXT NOT NULL
			`);
			DBModules.insertTable(
				DB,
				"todos",
				["title", "description", "byUser"],
				[title, description, username]
			);
			console.log(DBModules.queryAllTable(DB, "todos"));
		})
		res.send(`Created Row`);
	} catch(err) {
		res.status(400).send(err);
	}

}

module.exports = { createTodo };
