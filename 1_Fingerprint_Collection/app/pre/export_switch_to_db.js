const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({
    path: '../database/.env'
});

console.log("Loading json file");
const jsonString = fs.readFileSync('chromium-switches-list.json');
const jsonObject = JSON.parse(jsonString);

console.log("Connect to db");

const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
});

client.connect();

client.query(`
  CREATE TABLE IF NOT EXISTS "switch" (
    "id" BIGSERIAL PRIMARY KEY NOT NULL, 
    "name" text NOT NULL,
    "value" text,
    "tested" testList DEFAULT 'notTested'
  );
  INSERT INTO switch ("name", "value", "tested") VALUES ('','null','notTested');
`);

var query = 'INSERT INTO switch ("name", "value", "tested") VALUES \n'

for (const obj of jsonObject) {
  //query += "("+obj+",notTested),\n"
  //query += "('" + JSON.stringify(obj) + "','notTested'),\n";
  query += "('" + obj.join('')+"','null','notTested'),\n";
}
query = query.slice(0, -2) + "\n";
console.log(query)

console.log("Insert switch to database");

client.query(query)
  .then(res => {
    console.log(res.rows)
    client.end()
  })
  .catch(err => {
    console.error(err)
    client.end()
  })
