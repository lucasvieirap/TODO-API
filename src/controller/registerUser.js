require("dotenv").config({ path: "../.env" });

const DBModules = require("../db/data");

const { hashString } = require("../services/hashString");
const { signJWT } = require("../services/signJWT");

async function registerUser(req, res, DB) {
	const { username, email, passwd } = req.body;

	if (username === undefined || email === undefined || passwd === undefined) {
		res.status(400).send(`Fields Empty\n`);
		return;
	}

	const secret_key = process.env.SECRET_KEY.toString("hex").slice(0, 32);
	const secret_iv = process.env.SECRET_IV.toString("hex").slice(0, 16);
	const hashedPasswd = hashString(passwd, secret_key, secret_iv);

	const labelObject = { "username": username };
	const options = { expiresIn: "15m" };
	const jwt_key = process.env.SECRET_JWT;
	const signedJWT = signJWT(labelObject, options, jwt_key);

	async function registerUserOnDB() {
		try {
			DB.serialize(async () => {
				DBModules.createTable(
					DB, "users", true, `
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						username TEXT UNIQUE NOT NULL,
						email TEXT UNIQUE NOT NULL,
						passwd TEXT NOT NULL
				`);

				const userExists = await DBModules.queryTable(
					DB, 
					"users", 
					["username"], 
					[{"row": "username", "value": username}]
				);

				if (userExists) {
					console.log(userExists);
					res.send("User Already Exists\n");
					return;
				}

				DBModules.insertTable(
					DB,
					"users",
					["username", "email", "passwd"],
					[username, email, hashedPasswd]
				);

				console.log(DBModules.queryAllTable(DB, "users"));

				const usernameJSON = JSON.stringify(req.body.username);
				const signedJWTJSON = JSON.stringify(signedJWT);
				res.send(`Registed ${usernameJSON}\n${signedJWTJSON}\n`);

			})
		} catch (err) {
			const message = {"message": "Malformed Request", "err": err.message}
			res.status(400).send(JSON.stringify(message)+'\n');
			return;
		}
	}
	registerUserOnDB();
};

module.exports = { registerUser };
