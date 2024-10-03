const express = require("express");
const app = express();

const todo = require("./routes/todo");
const auth = require("./routes/auth");

app.use(express.json());
app.use("/", todo, auth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`SERVER RUNNING AT ${PORT}`);
})
