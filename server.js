import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



// dotenv.config();
console.log('URL de conexión:', process.env.DATABASE_URL);


// Importamos nuestra conexión a Postgres
import sql from './db.js';

// Crear la instancia de la aplicación Express
const app = express();

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Configuración de CORS (ajusta los orígenes según tus necesidades)
app.use(
  cors({
    origin: [
      'https://ganamosconantoni.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Para obtener la ruta del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================
// Configuración de Nodemailer
// =============================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ganamosconantonisoporte@gmail.com',
    pass: 'lrtj rcnd iqrw duti'
  }
});

/**
 * Función para generar números de boletos aleatorios no repetidos.
 * Comprueba la tabla TICKETS_MSTR para ver qué números existen
 * y genera los faltantes de forma aleatoria.
 */
async function generarNumerosBoletosUnicos(cantidad) {
  try {
    // 1. Obtenemos los tickets ya registrados (ahora se guardan como strings)
    const ticketsExistentes = await sql`
      SELECT TICKETS_NUMERO FROM TICKETS_MSTR
    `;
    const BLACKLIST = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'];

    // 2. Creamos un Set con esos valores (serán strings si en la BD ya están con ceros)
    const numerosExistentes = new Set(
      ticketsExistentes.map(t => t.tickets_numero)
    );

    // 3. Generamos nuevos números
    const numerosGenerados = new Set();

    while (numerosGenerados.size < cantidad) {
      let boletoString;
      
      // Primer bloque de generación
      do {
        const numeroAleatorio = Math.floor(Math.random() * 10000);
        boletoString = String(numeroAleatorio).padStart(4, '0');
      } while (BLACKLIST.includes(boletoString));
      
      if (!numerosExistentes.has(boletoString) && !numerosGenerados.has(boletoString)) {
        numerosGenerados.add(boletoString);
      }

      // Verificar si ya alcanzamos la cantidad deseada
      if (numerosGenerados.size >= cantidad) break;
      
      // Segundo bloque de generación
      const numeroAleatorio = Math.floor(Math.random() * 10000);
      boletoString = String(numeroAleatorio).padStart(4, '0');
      
      if (!numerosExistentes.has(boletoString) && !numerosGenerados.has(boletoString)) {
        numerosGenerados.add(boletoString);
      }
    }

    return Array.from(numerosGenerados);
  } catch (error) {
    console.error('Error al generar boletos:', error);
    return [];
  }
}


// =============================
// RUTAS
// =============================

/**
 * Obtener todos los pedidos: GET /api/pedidos
 */
app.get('/api/pedidos', async (req, res) => {
  try {
    // Leemos todos los registros de PEDIDO_MSTR
    const pedidos = await sql`
      SELECT * FROM PEDIDO_MSTR
    `;
    // Retornamos al frontend como JSON

    return res.json(pedidos);

  } catch (error) {
    console.error('Error inesperado al obtener pedidos:', error);
    return res.status(500).json({ error: 'Error interno al obtener pedidos' });
  }
});

/**
 * Aprobar un pedido y asignar boletos: PUT /api/pedidos/:referencia
 */
app.put('/api/pedidos/:referencia/:correo/:cantidad', async (req, res) => {
  try {
    const referencia = req.params.referencia

    const correo = req.params.correo
    const cantidad = req.params.cantidad

    // 1. Verificamos si existe un pedido con esa referencia
    const [pedidoEncontrado] = await sql`
      SELECT *
      FROM PEDIDO_MSTR
      WHERE PEDIDO_REFERENCIAS = ${referencia}
      LIMIT 1
    `;
    if (!pedidoEncontrado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // 2. Actualizamos el pedido como aprobado
    const [pedidoActualizado] = await sql`
      UPDATE PEDIDO_MSTR
      SET PEDIDO_APROBADO = true
      WHERE PEDIDO_REFERENCIAS = ${referencia}
      RETURNING *
    `;

    console.log("Se encontro el pedido con referencia: " + pedidoEncontrado.pedido_referencias )
    console.log("Su dueño es: " + pedidoEncontrado.pedido_nombre + " " +  pedidoEncontrado.pedido_apellido)
    console.log("La cantidad de boletos es: : " + pedidoEncontrado.pedido_boletos )
    // 3. Generamos los números de boletos únicos
    const numerosGenerados = await generarNumerosBoletosUnicos(
      pedidoEncontrado.pedido_boletos
    );

    // 4. Insertamos los nuevos tickets en TICKETS_MSTR
    //    Para insertar varios registros, construimos el array de objetos
    //    y luego usamos la sintaxis de postgres() para multiple inserts.
    const nuevosTickets = numerosGenerados.map(num => ({
      tickets_numero: num,
      tickets_referencia: pedidoEncontrado.pedido_referencias,
      tickets_propietario: `${pedidoEncontrado.pedido_nombre} ${pedidoEncontrado.pedido_apellido}`,
      tickets_correo: pedidoEncontrado.pedido_correo,
      tickets_fecha_compra: new Date()
    }));

    // Con la librería `postgres`, podemos hacer un insert masivo así:
    // sintaxis: sql`INSERT INTO table ${ sql(items, 'col1', 'col2', ...) }`
    await sql`
      INSERT INTO TICKETS_MSTR ${sql(
      nuevosTickets,
      'tickets_numero',
      'tickets_referencia',
      'tickets_propietario',
      'tickets_correo',
      'tickets_fecha_compra'
    )}
    `;

    const [BuscarUsuario] = await sql`
    SELECT * FROM USER_MSTR WHERE USER_CORREO= ${correo}
    
  `;

    if (BuscarUsuario) {
      const [ActualizarNúmeroPedidos] = await sql`
      UPDATE USER_MSTR SET USER_CANTIDAD_BOLETOS = USER_CANTIDAD_BOLETOS + ${cantidad} WHERE USER_CORREO= ${correo}
      RETURNING *
    `;
    }
    else {
      const [InsertarNúmeroPedidos] = await sql`
      INSERT INTO USER_MSTR (USER_CORREO, USER_CANTIDAD_BOLETOS)
      VALUES( ${correo}, ${cantidad})
      RETURNING *
    `;
    }



    // 5. Enviamos correo de confirmación
    const mailOptions = {
      from: 'sorteolisboaranch.0@gmail.com',
      to: pedidoEncontrado.pedido_correo,
      subject: '¡Tu pedido ha sido aprobado!',
      html: `
        <h1>¡Pedido Aprobado!</h1>
        <p>Hola ${pedidoEncontrado.pedido_nombre} ${pedidoEncontrado.pedido_apellido},</p>
        <p>Nos complace informarte que tu pedido con referencia #${pedidoEncontrado.pedido_referencias} ha sido aprobado.</p>
        <h2>Detalles del pedido:</h2>
        <ul>
          <li>Número de boletos: ${pedidoEncontrado.pedido_boletos}</li>
          <li>Precio total: $${pedidoEncontrado.pedido_precio_total}</li>
          <li>Número de contacto: ${pedidoEncontrado.pedido_numero}</li>
        </ul>
        <h2>Tus números de boletos son:</h2>
        <ul>
          ${numerosGenerados.map(numero => `<li>Boleto #${numero}</li>`).join('')}
        </ul>
        <p>¡Gracias por tu compra y mucha suerte!</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente');
    } catch (emailError) {
      console.error('Error al enviar correo:', emailError);
    }

    // 6. Respuesta final
    return res.json({
      success: true,
      pedido: pedidoActualizado,
      tickets: numerosGenerados
    });
  } catch (error) {
    console.error('Error al procesar PUT /api/pedidos/:referencia:', error);
    return res.status(500).json({ error: 'Error interno al actualizar el pedido' });
  }
});

/**
 * Aprobar un pedido y asignar boletos: DELETE /api/pedidos/:referencia
 */
app.delete('/api/pedidos/:referencia/:correo', async (req, res) => {
  try {
    const referencia = req.params.referencia
    const correo = req.params.correo

    // 1. Verificamos si existe un pedido con esa referencia
    //   const [pedidoEncontrado] = await sql`
    //     SELECT *
    //     FROM PEDIDO_MSTR
    //     WHERE PEDIDO_REFERENCIAS = ${referencia}
    //     LIMIT 1
    //   `;
    //   if (!pedidoEncontrado) {
    //     return res.status(404).json({ error: 'Pedido no encontrado' });
    //   }

    // 2. Actualizamos el pedido como aprobado
    const [pedidoBorrado] = await sql`
        DELETE FROM  PEDIDO_MSTR
        WHERE PEDIDO_REFERENCIAS = ${referencia} AND PEDIDO_CORREO =  ${correo}
        RETURNING *
      `;


    // 3. Borramos el registro de la ticket master
    const [ticketsBorrados] = await sql`
        DELETE FROM  TICKETS_MSTR
        WHERE TICKETS_REFERENCIA = ${referencia} AND TICKETS_CORREO =  ${correo}
        RETURNING *
      `;

    // 3. Borramos el registro de la user master
    const [userBorrados] = await sql`
        DELETE FROM  USER_MSTR
        WHERE USER_CORREO =  ${correo}
        RETURNING *
      `;






    // 6. Respuesta final
    return res.json({
      success: true,
      pedido: pedidoBorrado,
      tickets: ticketsBorrados,
      user: userBorrados
    });
  } catch (error) {
    console.error('Error al procesar PUT /api/pedidos/:referencia:', error);
    return res.status(500).json({ error: 'Error interno al actualizar el pedido' });
  }
});

/**
 * Guardar un nuevo pedido: POST /api/pedidos
 */
app.post('/api/pedidos', async (req, res) => {
  try {
    const pedido = req.body;

    // Insertamos el nuevo pedido en la tabla PEDIDO_MSTR
    // Asegúrate de alinear los campos con las columnas de tu tabla
    const [nuevoPedido] = await sql`
      INSERT INTO PEDIDO_MSTR (
        PEDIDO_NOMBRE,
        PEDIDO_APELLIDO,
        PEDIDO_CORREO,
        PEDIDO_BOLETOS,
        PEDIDO_PRECIO_TOTAL,
        PEDIDO_REFERENCIAS,
        PEDIDO_NUMERO
        
      ) VALUES (
        ${pedido.nombre},
        ${pedido.apellido},
        ${pedido.correo},
        ${pedido.boletos},
        ${pedido.precioTotal},
        ${pedido.referencias},
        ${pedido.numero}
      )
      RETURNING *
    `;




    console.log(` ${pedido.nombre},
        ${pedido.apellido},
        ${pedido.correo},
        ${pedido.boletos},
        ${pedido.precioTotal},
        ${pedido.referencias},
        ${pedido.numero}`)

    return res.json({
      success: true,
      message: 'Pedido guardado correctamente',
      pedido: nuevoPedido
    });
  } catch (error) {
    console.error('Mensaje de error:', error.message);
console.error('Stack completo del error:', error.stack);

    console.error('Error al guardar el pedido:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al guardar el pedido',
      error: error.message
    });
  }
});


app.get('/api/consulta', async (req, res) => {
  const { correo, ref, tick } = req.query;  // <--- CORRECTO


  console.log('correo: ', correo)
  try {
    const clientData = await sql`
      SELECT DISTINCT ON (p.PEDIDO_CORREO)
        p.PEDIDO_CORREO,
        p.PEDIDO_NOMBRE,
        p.PEDIDO_APELLIDO,
        p.PEDIDO_NUMERO,
        u.USER_CANTIDAD_BOLETOS
        FROM PEDIDO_MSTR p
        JOIN USER_MSTR u ON p.PEDIDO_CORREO = u.USER_CORREO
        WHERE
          1=1
          ${
      // Solo agregamos el AND si hay correo
      correo && correo.trim() !== ''
        ? sql`AND p.PEDIDO_CORREO LIKE ${'%' + correo + '%'}`
        : sql``
      }
   AND p.PEDIDO_APROBADO = true
        ORDER BY 
          p.PEDIDO_CORREO,             -- la columna del DISTINCT ON
          u.USER_CANTIDAD_BOLETOS DESC 
    `;

    return res.json({
      clients: clientData // array con las filas, ordenadas por la cantidad de boletos
    });
  } catch (error) {
    console.error('Error al consultar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar',
      error: error.message
    });
  }
});

app.get('/api/correo', async (req, res) => {
  const { numero } = req.query;
  try {



    const arrayNumeros = await sql`
      SELECT TICKETS_CORREO
      FROM TICKETS_MSTR
      WHERE TICKETS_NUMERO = ${numero}
     
    `;

    // 4) Retornamos todo al front
    return res.json({

      tickets: arrayNumeros,    // un array con las filas de TICKETS_MSTR

    });
  } catch (error) {
    console.error('Error al consultar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar',
      error: error.message
    });
  }
});


app.get('/api/array', async (req, res) => {
  const { correo } = req.query;
  try {



    const arrayNumeros = await sql`
      SELECT TICKETS_NUMERO
      FROM TICKETS_MSTR
      WHERE TICKETS_CORREO = ${correo}
     
    `;

    // 4) Retornamos todo al front
    return res.json({

      tickets: arrayNumeros,    // un array con las filas de TICKETS_MSTR

    });
  } catch (error) {
    console.error('Error al consultar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar',
      error: error.message
    });
  }
});

app.get('/api/tickets', async (req, res) => {

  try {



    const arrayNumeros = await sql`
      SELECT TICKETS_NUMERO
      FROM TICKETS_MSTR
       `;

    const boletos = arrayNumeros.map(r => r.tickets_numero);

    res.json(boletos);

  } catch (error) {
    console.error('Error al consultar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar',
      error: error.message
    });
  }
});

app.get('/api/totaltickets', async (req, res) => {
  const { correo } = req.query;
  console.log('correo proporcionado: ', correo)
  try {

    // 3) Otras consultas (si solo devuelven una fila, ahí sí puedes desestructurar).
    const totalTickets = await sql`
      SELECT USER_CANTIDAD_BOLETOS
      FROM USER_MSTR
      WHERE USER_CORREO = ${correo}
    `;



    // 4) Retornamos todo al front
    return res.json({

      total: totalTickets,    // un array con las filas de TICKETS_MSTR

    });
  } catch (error) {
    console.error('Error al consultar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar',
      error: error.message
    });
  }
});


app.get('/api/ventatotal', async (req, res) => {
  try {
    // Leemos todos los registros de PEDIDO_MSTR
    const [totalVendidos] = await sql`
      SELECT COUNT(TICKETS_NUMERO) AS total FROM TICKETS_MSTR
    `;
    // Retornamos al frontend como JSON

    return res.json(totalVendidos.total);

  } catch (error) {
    console.error('Mensaje de error:', error.message);
console.error('Stack completo del error:', error.stack);

    console.error('Error inesperado al obtener el total de los boletos vendidos hasta ahora:', error);
    return res.status(500).json({ error: 'Error interno al obtener el total de boletos vendidos' });
  }
});



// =============================
// Iniciar el servidor
// =============================
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
