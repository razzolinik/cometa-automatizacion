// estados.js
// Maquina de estados del bot, tal como se define en la sección 7 de la guía del TPI.
// Cada estado representa en que punto de la conversación esta el cliente.

const ESTADOS = {
  INICIO: "INICIO",
  ESPERANDO_CODIGO: "ESPERANDO_CODIGO",
  ESPERANDO_CANTIDAD: "ESPERANDO_CANTIDAD",
  FIN_RESERVADO: "FIN_RESERVADO",
  FIN_SIN_STOCK: "FIN_SIN_STOCK",
  FIN_DERIVADO: "FIN_DERIVADO",
};

// Tabla de transiciones documentada como referencia.
// No se usa de forma programática en index.js porque el flujo es lineal y simple,
// pero queda acá para cumplir con la consigna de trasladar la tabla a un objeto.
const TRANSICIONES = {
  INICIO: {
    cliente_escribe: ESTADOS.ESPERANDO_CODIGO,
  },
  ESPERANDO_CODIGO: {
    codigo_existe: ESTADOS.ESPERANDO_CANTIDAD,
    codigo_no_existe_reintento: ESTADOS.ESPERANDO_CODIGO,
    codigo_no_existe_tercer_intento: ESTADOS.FIN_DERIVADO,
  },
  ESPERANDO_CANTIDAD: {
    stock_suficiente: ESTADOS.FIN_RESERVADO,
    stock_insuficiente: ESTADOS.FIN_SIN_STOCK,
  },
};

module.exports = { ESTADOS, TRANSICIONES };
