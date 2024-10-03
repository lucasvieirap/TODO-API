require("dotenv").config({ path: "../.env" });

const DBModules = require("../db/data");

const { dehashString } = require("../services/hashString");
const { signJWT } = require("../services/signJWT");

 async function loginUser(req, res, DB) {
	const { username, passwd } = req.body;
	if (username === undefined || passwd === undefined) {
		res.send("Username or Password Empty\n");
		return;
	}

	const userRow = await DBModules.queryTable(
		DB,
		"users",
		["username", "email", "passwd"],
		[{"row": "username", "value": username}]
	);
	if (userRow === undefined) {
		res.send("User doesn't exists\n");
		return;
	}

	const secret_key = process.env.SECRET_KEY.toString("hex").slice(0, 32);
	const secret_iv = process.env.SECRET_IV.toString("hex").slice(0, 16);
	const dehashedPasswd = dehashString(userRow.passwd, secret_key, secret_iv);
	const userAuth = dehashedPasswd === passwd;
	if (!userAuth) {
		res.status(401).send("Wrong Password\n");
		return;
	}

	const labelObject = { "username": username };
	const options = { expiresIn: "15m" };
	const jwt_key = process.env.SECRET_JWT;
	const signedJWT = signJWT(labelObject, options, jwt_key);

	const signedJWTJSON = JSON.stringify(signedJWT);
	res.send(signedJWTJSON + '\n');
};

module.exports = { loginUser };
