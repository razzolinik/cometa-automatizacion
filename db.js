// db.js
// Se encarga de leer y escribir el archivo JSON que simula la base de datos.
// Cada vez que se confirma una reserva, el cambio de stock se persiste acá.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

// Lee el estado actual de la base de datos desde el disco.
// Devuelve un objeto JS plano con "productos" y "reservas".
function leerDB() {
  const rawData = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(rawData);
}

// Guarda el objeto recibido de vuelta en db.json.
// Se usa indentación de 2 espacios para que el archivo quede legible en los diffs de GitHub.
function guardarDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { leerDB, guardarDB };
