const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
// Aumentamos el límite de tamaño para aceptar imágenes de avatares en Base64
app.use(express.json({ limit: '5mb' })); // <-- CAMBIO

const MONGO_URI = 'mongodb://mongodb:27017';
const client = new MongoClient(MONGO_URI);

let thoughtsCollection;
let profileCollection;

// --- Helper para transformar el _id de Mongo a id ---
function mapMongoId(item) {
    if (!item) return null;
    const { _id, ...rest } = item;
    return { id: _id, ...rest };
}

async function run() {
    await client.connect();
    const db = client.db('thoughts_db');
    thoughtsCollection = db.collection('thoughts');
    profileCollection = db.collection('profile');
    console.log("Conectado a MongoDB");

    const profile = await profileCollection.findOne();
    if (!profile) {
        profileCollection.insertOne({
            fullName: "Nombre y Apellido",
            username: "username",
            avatar: null,
            displayNamePref: "fullName"
        });
    }
}
run();

// --- API para Thoughts ---
app.get('/api/thoughts', async (req, res) => {
    const thoughts = await thoughtsCollection.find({}).toArray();
    // Mapeamos el _id a id para cada "thought"
    res.json(thoughts.map(mapMongoId)); // <-- CAMBIO
});

app.post('/api/thoughts', async (req, res) => {
    const { content, parentId } = req.body;
    const newThought = {
        content,
        parentId: parentId || null,
        createdAt: Date.now()
    };
    const result = await thoughtsCollection.insertOne(newThought);
    const savedThought = await thoughtsCollection.findOne({ _id: result.insertedId });
    res.status(201).json(mapMongoId(savedThought)); // <-- CAMBIO
});

// --- API para Perfil ---
app.get('/api/profile', async (req, res) => {
    const profile = await profileCollection.findOne();
    // Mapeamos el _id a id también para el perfil
    res.json(mapMongoId(profile)); // <-- CAMBIO
});

app.post('/api/profile', async (req, res) => {
    const patch = req.body;
    // El frontend puede enviar el 'id', que no es parte del documento de Mongo
    delete patch.id; 
    await profileCollection.updateOne({}, { $set: patch }, { upsert: true });
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Backend escuchando en el puerto 3000');
});