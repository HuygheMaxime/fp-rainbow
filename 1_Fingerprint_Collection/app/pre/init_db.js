const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({
    path: '../database/.env'
});

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

var query =`
	CREATE TYPE testList AS ENUM ('notTested','testInProgress','tested');
	CREATE TYPE status AS ENUM ('success','timeout','wip','crash','flagnotworking');
	
	CREATE TABLE IF NOT EXISTS "runtimeconfig" (
	  "uuid" uuid PRIMARY KEY NOT NULL,
	  "date" date NOT NULL DEFAULT CURRENT_DATE,
	  "headless" boolean NOT NULL,
	  "browserversion" text NOT NULL,
	  "os_platform" text NOT NULL,
	  "os_version" text NOT NULL,
	  "os_architecture" text NOT NULL,
	  "full_commandline" text NOT NULL,
	  "status" status default 'success'
	);

	CREATE TABLE IF NOT EXISTS "switch" (
	  "id" BIGSERIAL PRIMARY KEY NOT NULL,
	  "name" text NOT NULL,
	  "value" text,
	  "tested" testList default 'notTested'
	);

	CREATE TABLE IF NOT EXISTS "runtimeconfig_switch" (
	  "runtimeconfig_uuid" uuid NOT NULL,
	  "switch_id" BIGINT NOT NULL,
	  PRIMARY KEY ("runtimeconfig_uuid", "switch_id"),
	  FOREIGN KEY ("runtimeconfig_uuid") REFERENCES "runtimeconfig" ("uuid") ON DELETE CASCADE,
	  FOREIGN KEY ("switch_id") REFERENCES "switch" ("id") ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS "flag" (
	  "id" BIGSERIAL PRIMARY KEY NOT NULL,
	  "nameid" VARCHAR(255) UNIQUE,
	  "nametext" VARCHAR(255) NOT NULL,
	  "description" TEXT,
	  "optionstatus" VARCHAR(50) NULL,
	  "availableoption" TEXT[] NULL,
	  "availableoptionlenght" INTEGER NULL,
	  "test" VARCHAR(255) NULL
	);

	CREATE TABLE IF NOT EXISTS "runtimeconfig_flag" (
	  "runtimeconfig_uuid" uuid NOT NULL,
	  "flags_id" BIGINT NOT NULL,
	  PRIMARY KEY ("runtimeconfig_uuid", "flags_id"),
	  FOREIGN KEY ("runtimeconfig_uuid") REFERENCES "runtimeconfig" ("uuid") ON DELETE CASCADE,
	  FOREIGN KEY ("flags_id") REFERENCES "flag" ("id") ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS systeminformation_static (
          id TEXT PRIMARY KEY,
          json_si JSONB NOT NULL
        );

	CREATE TABLE IF NOT EXISTS systeminformation_dynamic (
          id TEXT PRIMARY KEY,
          json_si JSONB NOT NULL
        );

	CREATE TABLE IF NOT EXISTS runtimeconfig_systeminformation (
          runtimeconfig_uuid UUID NOT NULL,
          systeminformation_static_id TEXT NOT NULL,
          systeminformation_dynamic_id TEXT,
          FOREIGN KEY (runtimeconfig_uuid) REFERENCES runtimeconfig (uuid),
          FOREIGN KEY (systeminformation_static_id) REFERENCES systeminformation_static (id),
          FOREIGN KEY (systeminformation_dynamic_id) REFERENCES systeminformation_dynamic (id)
        );

`;


console.log("Create table");

client.query(query)
  .then(res => {
    console.log(res.rows)
    client.end()
  })
  .catch(err => {
    console.error(err)
    client.end()
  })
