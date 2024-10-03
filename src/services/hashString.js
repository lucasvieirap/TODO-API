const crypto = require("crypto");

function hashString(string, secret_key, secret_iv) {
	const cipher = crypto.createCipheriv("aes-256-cbc", secret_key, secret_iv);
	const hashedString = cipher.update(string, "utf8", "hex") + cipher.final("hex");
	return hashedString;
};

function dehashString(string, secret_key, secret_iv) {
	const cipher = crypto.createCipheriv("aes-256-cbc", secret_key, secret_iv);
	const decipher = crypto.createDecipheriv("aes-256-cbc", secret_key, secret_iv);
	const dehashedString = decipher.update(string, "hex", "utf8") + decipher.final("utf8");
	return dehashedString;
};

module.exports = { hashString, dehashString };
