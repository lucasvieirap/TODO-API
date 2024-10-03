const sqlite3 = require("sqlite3").verbose();

function connectToDb(databasePath, printMessage) {
	const DB = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) { return console.error(err.message) };
		console.log(printMessage);
	});
	return DB;
}

function _createTable(DB, tableName, ifNotExist, components) {
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

function _deleteTable(DB, tableName, constraintVar, constraintVal) {
	const constraint = `${constraintVar} = ${constraintVal}`;
	const sql = `DELETE FROM ${tableName} WHERE ${constraint}`;
	console.log(sql);
}

function queryMultipleTable(DB, tableName, tableVal, options) {
	const distinct = options?.distinct ? "DISTINCT" : "";
	const orderBy = options?.orderBy ? "ORDER BY" : "";
	const sql = `SELECT ${distinct} ${tableVal} FROM ${tableName} ${orderBy} ${options?.orderBy}`;
	console.log(sql);
}

async function queryTable(DB, tableName, columns, constraints) {
	return new Promise((resolve, reject) => {
		const and = constraints.length > 1 ? "AND" : "";
		const sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName} WHERE ${constraints.map(constraint => `${constraint.row} = ?`).join(` ${and} `)}`;
		// let sql = `SELECT ${columns.map(column => column).join(", ")} FROM ${tableName}`;
		DB.get(sql, constraints.map(constraint => constraint.value), (err, row) => {
			if (err) { 
				console.log(err.message) 
				reject(err);
			};
			resolve(row);
		})
	})
}

function queryAllTable(DB, tableName) {
	const sql = `SELECT * FROM ${tableName}`;
	DB.all(sql, [], function (err, row) {
		if (err) {  return console.error(err.message) };
		console.log(row);
	});
}

function updateTable(DB, tableName, column, newColumnVal, constraint) {
	const sql = `UPDATE ${tableName} SET ${column} = ${newColumnVal} WHERE ${constraint.where} = ${constraint.equals}`;
	console.log(sql);
}

module.exports = { connectToDb, _createTable, _dropTable, insertTable, _deleteTable, queryMultipleTable, queryTable, queryAllTable };
