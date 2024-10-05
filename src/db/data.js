const sqlite3 = require("sqlite3").verbose();

function connectToDb(databasePath, printMessage) {
	const DB = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) { return console.error(err.message) };
		console.log(printMessage);
	});
	return DB;
}

function createTable(DB, tableName, ifNotExist, components) {
	const createIf = ifNotExist ? "IF NOT EXISTS" : "";
	const sql = `CREATE TABLE ${createIf} ${tableName}(${components})`;
	DB.run(sql, [], function (err) {
		if (err) { return console.error(err.message) };
		console.log(`CREATED TABLE ${tableName}`);
	});
}

function _dropTable(DB, tableName) {
	const sql = `DROP TABLE ${tableName}`;
	DB.run(sql, [], function (err) {
		if (err) { return console.error(err.message) };
		console.log(`DROPED TABLE ${tableName}`);
	});
}

async function insertTable(DB, tableName, components, values) {
	const insertValues = `${components.map(component => component).join(',')}`
	const insertPlaceholders = `${components.map(component => '?').join(',')}`;
	const sql = `INSERT INTO ${tableName} (${insertValues}) VALUES(${insertPlaceholders})`;
	console.log(sql);
	DB.run(sql, values, function (err) {
		if (err) {  console.log(err) };
		console.log(`A Row has been Inserted (RowId: ${this.lastID})`);
	});
}

function deleteTable(DB, tableName, constraints) {
	const and = constraints.length > 1 ? "AND" : "";
	const sql = `DELETE FROM ${tableName} WHERE ${constraints.map(constraint => `${constraint.row} = ${constraint.value}`).join(` ${and} `)}`;
	console.log(sql);
	DB.run(sql, [], function (err, row){
		if (err) { console.error(err.message) };
	});
}

function queryMultipleTable(DB, tableName, columns, constraints) {
	return new Promise((resolve, reject) => {
		const and = constraints.length > 1 ? "AND" : "";
		const sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName} WHERE ${constraints.map(constraint => `${constraint.row} = ?`).join(` ${and} `)}`;
		// let sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName}`;
		DB.all(sql, constraints.map(constraint => constraint.value), (err, rows) => {
			if (err) { 
				console.log(err.message) 
				reject(err);
			};
			resolve(rows);
		})
	})
}

async function queryTable(DB, tableName, columns, constraints) {
	return new Promise((resolve, reject) => {
		const and = constraints.length > 1 ? "AND" : "";
		const sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName} WHERE ${constraints.map(constraint => `${constraint.row} = ?`).join(` ${and} `)}`;
		// let sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName}`;
		DB.get(sql, constraints.map(constraint => constraint.value), (err, rows) => {
			if (err) { 
				reject(err);
			};
			if (rows === undefined) {
				reject(new Error("No Row Found"));
			}
			console.log('\n' + sql);
			resolve(rows);
		})
	})
}

function queryAllTable(DB, tableName) {
	const sql = `SELECT * FROM ${tableName}`;
	DB.all(sql, [], function (err, rows) {
		if (err) {  return console.error(err.message) };
		console.log(rows);
	});
}

function updateTable(DB, tableName, columns, constraints) {
	return new Promise((resolve, reject) => {
		const and = constraints.length > 1 ? "AND" : "";
		const sql = `UPDATE ${tableName} SET ${columns.map(column => `${column.row} = ${column.newValue}`)} WHERE ${constraints.map(constraint => `${constraint.row} = ${constraint.value}`).join(` ${and} `)}`;
		DB.run(sql, [], function (err, changes) {
			if (err) { reject( new Error(err.message)) };
			console.log('\n' + sql);
			resolve(changes);
		});
	})
}

module.exports = { connectToDb, createTable, _dropTable, insertTable, deleteTable, queryMultipleTable, queryTable, queryAllTable, updateTable };
