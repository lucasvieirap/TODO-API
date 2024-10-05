require("dotenv").config({ path: "../.env" });
const { verifyJWT } = require("../services/verifyJWT");

function auth(req, res, next) {
	const token = req.headers.authorization;

	const tokenString = token.toString();
	const jwt_secret = process.env.SECRET_JWT;
	const options = { expiresIn: "15m" };

	try {
		const verifiedToken = verifyJWT(tokenString, options, jwt_secret);
		const verifiedTokenString = JSON.stringify(verifiedToken);

		if (!verifiedToken) {
			res.send("Authorization Failed");
			return;
		}

		console.log("\nAUTHORIZATION MIDDLEWARE === ")
		console.log(`Token Verification Successful:`);
		console.log(`VerifiedToken: ${verifiedTokenString}`);
		next();
	} catch( err ) {
		const message = {"message": "Unauthorized", "err": err.message}
		res.status(401).send(JSON.stringify(message)+'\n');
		return;
	}
};

module.exports = { auth };
