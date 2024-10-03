const jwt = require("jsonwebtoken");

function verifyJWT(labelObject, options, jwt_secret) {
	const token = jwt.verify(labelObject, jwt_secret, options);
	return { "token": token };
};

module.exports = { verifyJWT };
