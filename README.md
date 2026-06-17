# Bot de consulta de stock y reserva — Cometa

TPI de Organización Empresarial (UTN TUPaD). Bot por consola que automatiza el proceso de consulta de stock y reserva de producto para Cometa, un local de venta de hardware informático.

## Alumnos - Comisión 5
Razzolini Khiara
Franco Rossi

## Descripción del proceso

Hoy un cliente pregunta por teléfono o en el local si hay stock de un producto, el vendedor va a mirar manualmente y no queda ningún registro. El bot reemplaza esa consulta: el cliente ingresa el código de producto, si existe y hay stock suficiente la reserva se confirma y se descuenta del stock; si no hay stock suficiente se informa la cantidad real disponible.

## Stack Técnico
* **Lenguaje:** JavaScript (Node.js)
* **Arquitectura:** Máquina de estados.
* **Persistencia:** JSON (archivo plano).

## Instalación 
Requisitos: Tener instalado Node.js (https://nodejs.org/es) 

```
npm install
```

## Cómo correrlo

```
node index.js
```

## Estructura de carpetas

```
cometa-bot/
├── index.js          # Loop principal del bot, los dos gateways y las validaciones
├── estados.js         # Máquina de estados de la conversación
├── db.js               # Funciones de lectura y escritura del JSON
├── db.json             # Catálogo de productos y registro de reservas
├── docs/               # Diagramas BPMN as-is y to-be
├── capturas/            # Capturas de pruebas y consultas a IA
└── README.md
```

## Reglas de negocio

- Catálogo cerrado: solo se reconocen los 6 productos cargados en `db.json`.
- Si el código no existe, se permiten 2 reintentos; al tercer error se deriva a un vendedor.
- Si el stock disponible es mayor o igual a la cantidad pedida, se confirma la reserva y se descuenta del stock.
- Si el stock es menor a la cantidad pedida (incluido 0), se informa la cantidad real disponible y no se reserva nada.
- Toda reserva queda pendiente de retiro por 48 horas (dato de referencia para el manual de usuario, no se programa un vencimiento automático).
