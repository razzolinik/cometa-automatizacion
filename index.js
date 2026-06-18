// index.js
// Loop principal del bot de consulta de stock y reserva para Cometa.
// Sigue el flujo to-be descripto en la guía: dos gateways (existencia del codigo
// y comparacion de stock contra cantidad pedida) y derivacion a vendedor tras 3 intentos fallidos.

const readlineSync = require("readline-sync");
const { leerDB, guardarDB } = require("./db");
const { ESTADOS } = require("./estados");

const MAX_REINTENTOS = 2; // segun la guia: 2 reintentos, al tercer error se corta

// Formatea un numero como pesos argentinos para mostrarlo igual que en el manual de usuario.
function formatearPrecio(monto) {
  return `$${monto.toLocaleString("es-AR")}`;
}

// Gateway 1: busca el producto por codigo dentro del catalogo.
// Devuelve el objeto producto o undefined si no existe.
function buscarProducto(db, codigo) {
  return db.productos.find((p) => p.codigo === codigo.trim().toUpperCase());
}

// Pide el codigo de producto al cliente, con reintentos limitados.
// Si se agotan los intentos, el estado pasa a FIN_DERIVADO.
function pedirCodigoProducto(db) {
  let intentos = 0;

  while (intentos <= MAX_REINTENTOS) {
    const codigoIngresado = readlineSync.question(
      "Bot: Decime el codigo del producto que queres consultar.\nCliente: "
    );

    const producto = buscarProducto(db, codigoIngresado);

    if (producto) {
      return { estado: ESTADOS.ESPERANDO_CANTIDAD, producto };
    }

    intentos++;

    if (intentos > MAX_REINTENTOS) {
      console.log(
        "Bot: No pudimos encontrar ese codigo en nuestro catalogo. Te derivo con un vendedor para que te ayude personalmente."
      );
      return { estado: ESTADOS.FIN_DERIVADO };
    }

    console.log(
      `Bot: Ese codigo no existe en nuestro catalogo. Intentalo de nuevo (te quedan ${MAX_REINTENTOS - intentos + 1} intentos).`
    );
  }
}

// Valida que la cantidad ingresada sea un numero entero positivo.
// Cubre los casos de camino infeliz: texto en lugar de numero, cero y negativos.
function pedirCantidadValida() {
  while (true) {
    const entrada = readlineSync.question("Cliente: ");
    const cantidad = Number(entrada);

    if (Number.isNaN(cantidad)) {
      console.log("Bot: Ingresa solo un numero, por favor.");
      continue;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      console.log("Bot: La cantidad tiene que ser un numero entero mayor a cero.");
      continue;
    }

    return cantidad;
  }
}

// Gateway 2: compara el stock disponible contra la cantidad pedida.
// Si alcanza, descuenta el stock y registra la reserva como confirmada.
// Si no alcanza, informa el stock real disponible y no reserva nada.
// nombreCliente se recibe para que el registro identifique quien hizo la consulta.
function procesarReserva(db, producto, cantidadPedida, nombreCliente) {
  // Se guarda el stock disponible ANTES de descontar, para que el registro
  // refleje el estado real del sistema en el momento de la consulta.
  const stockAlMomento = producto.stock;

  if (producto.stock >= cantidadPedida) {
    producto.stock -= cantidadPedida;

    db.reservas.push({
      cliente: nombreCliente,
      producto_codigo: producto.codigo,
      cantidad: cantidadPedida,
      stock_al_momento: stockAlMomento,
      estado: "confirmada",
    });

    guardarDB(db);

    console.log(
      `Bot: Hay stock suficiente. Reserva confirmada: ${cantidadPedida} unidades. Stock restante: ${producto.stock}.`
    );
    return ESTADOS.FIN_RESERVADO;
  }

  db.reservas.push({
    cliente: nombreCliente,
    producto_codigo: producto.codigo,
    cantidad: cantidadPedida,
    stock_al_momento: stockAlMomento,
    estado: "sin_stock_suficiente",
  });

  guardarDB(db);

  console.log(
    `Bot: No tenemos esa cantidad disponible. Actualmente hay ${producto.stock} unidades en stock.`
  );
  return ESTADOS.FIN_SIN_STOCK;
}

// Funcion principal: orquesta todo el flujo de punta a punta.
function main() {
  console.log("Bot: Hola, bienvenido a Cometa.");

  const db = leerDB();

  // Se pide el nombre para que el registro de reservas identifique quien consulta,
  // en lugar de guardar siempre un valor fijo como "Cliente simulado".
  const nombreCliente = readlineSync.question(
    "Bot: Decime tu nombre, por favor.\nCliente: "
  );

  const resultadoCodigo = pedirCodigoProducto(db);

  if (resultadoCodigo.estado === ESTADOS.FIN_DERIVADO) {
    // Antes esta rama no dejaba ningun registro. Ahora se guarda la derivacion
    // para que el diccionario de datos (reserva.estado = "derivado") sea real
    // y no solo un valor documentado que el codigo nunca generaba.
    db.reservas.push({
      cliente: nombreCliente,
      producto_codigo: null,
      cantidad: null,
      stock_al_momento: null,
      estado: "derivado",
    });
    guardarDB(db);
    return;
  }

  const { producto } = resultadoCodigo;

  console.log(
    `Bot: ${producto.nombre} — ${formatearPrecio(producto.precio)}.`
  );

  // Caso especial: si no hay stock, ni se pide la cantidad (seccion 10 de la guia).
  if (producto.stock === 0) {
    db.reservas.push({
      cliente: nombreCliente,
      producto_codigo: producto.codigo,
      cantidad: null,
      stock_al_momento: producto.stock,
      estado: "sin_stock_suficiente",
    });
    guardarDB(db);

    console.log("Bot: Actualmente no tenemos stock disponible.");
    return;
  }

  console.log("Bot: Cuantas unidades queres reservar?");
  const cantidadPedida = pedirCantidadValida();

  procesarReserva(db, producto, cantidadPedida, nombreCliente);
}

main();