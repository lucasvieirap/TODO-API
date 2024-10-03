require("dotenv").config({ path: "./src/.env" });
const express = require("express");
const router = express.Router();

const DBModules = require("../db/data");
const DB = DBModules.connectToDb("./src/db/database.db", "Connected to SQLite Database");

const secret_key = process.env.SECRET_KEY.toString("hex").slice(0, 32);
const secret_iv = process.env.SECRET_IV.toString("hex").slice(0, 16);

const { signJWT } = require("../services/signJWT");
const { hashString } = require("../services/hashString");

const { registerUser } = require("../controller/registerUser");
const { loginUser } = require("../controller/loginUser");

router.post("/register", (req, res) => { registerUser(req, res, DB) });
router.post("/login", (req, res) => { loginUser(req, res, DB) });

module.exports = router;
