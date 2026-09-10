"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_LOGS_SQL = exports.CREATE_TOKENS_SQL = exports.CREATE_PATIENTS_SQL = exports.CREATE_USERS_SQL = void 0;
exports.CREATE_USERS_SQL = `
CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) UNIQUE,
  password_hash varchar(255),
  role varchar(255) NOT NULL,
  department varchar(255),
  status varchar(32) NOT NULL DEFAULT 'active'
)
`;
exports.CREATE_PATIENTS_SQL = `
CREATE TABLE patients (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  age integer NOT NULL,
  phone varchar(20) NOT NULL,
  
)
`;
exports.CREATE_TOKENS_SQL = `
CREATE TABLE tokens (
  id serial PRIMARY KEY,
  token_number varchar(255) NOT NULL,
  patient_id integer REFERENCES patients(id),
  department varchar(255) NOT NULL,
  status varchar(255) NOT NULL,
  priority varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
)
`;

