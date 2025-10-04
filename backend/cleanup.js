// backend/cleanup.js

const { MongoClient } = require('mongodb');

// URI de conexión (la misma que usa tu servidor)
const MONGO_URI = 'mongodb://mongodb:27017';
const DB_NAME = 'thoughts_db';
const COLLECTION_NAME = 'thoughts';

async function cleanupTrashThoughts() {
  const client = new MongoClient(MONGO_URI);
  console.log('Iniciando la limpieza de pensamientos basura...');

  try {
    // Conectar al servidor de MongoDB
    await client.connect();
    console.log('Conectado a la base de datos.');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // El filtro para encontrar los pensamientos basura
    const query = { isTrash: true };

    // Ejecutar la eliminación
    const result = await collection.deleteMany(query);

    console.log(`¡Limpieza completada! Se eliminaron ${result.deletedCount} pensamientos basura.`);

  } catch (err) {
    console.error('Ocurrió un error durante la limpieza:', err);
  } finally {
    // Asegurarse de que el cliente se cierre al finalizar
    await client.close();
    console.log('Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la función de limpieza
cleanupTrashThoughts();