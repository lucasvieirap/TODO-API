require("dotenv").config({ "path": "../.env" });
const { verifyJWT } = require("../services/verifyJWT");

function getInfoOnJWT(token, label) {
	const tokenString = token.toString();
	const jwt_secret = process.env.SECRET_JWT;
	const options = { expiresIn: "15m" };

	const verifiedToken = verifyJWT(tokenString, options, jwt_secret);
	const verifiedTokenString = JSON.stringify(verifiedToken);

	if (!verifiedToken) {
		res.status(401).send(JSON.stringify({"message": "Unauthorized"}));
		return;
	}

	const tokenLabel = verifiedToken?.token[label];
	if (!tokenLabel) {
		res.status(401).send(`Couldn't get ${label} from Token \n`);
		return;
	}

	return tokenLabel;
}

module.exports = { getInfoOnJWT };
