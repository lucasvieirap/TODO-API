const jwt = require("jsonwebtoken");

function signJWT(labelObject, options, JWT_SECRET) {
	const token = jwt.sign(labelObject, JWT_SECRET, options);
	return { "token": token };
};

module.exports = { signJWT };
