import express from 'express';
import fs from 'fs';
import * as path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

if (!fs.existsSync('Deportes.json')) {
    const deportes = { "deportes": [] };
    fs.writeFileSync('Deportes.json', JSON.stringify(deportes, null, 2), 'utf8');
}

app.get("/agregar", (req, res) => {
    const { nombre, precio } = req.query;
    if (!nombre || !precio) {
        res.status(400).send("Nombre y precio son requeridos.")
    } else {
        const deporte = { nombre, precio };
        const data = JSON.parse(fs.readFileSync('Deportes.json', 'utf8'));
        const deportes = data.deportes;
        deportes.push(deporte);
        fs.writeFileSync('Deportes.json', JSON.stringify(data));
        res.send("Deporte almacenado con éxito.")
    }
});

app.get("/deportes", (req, res) => {
    const data = JSON.parse(fs.readFileSync('Deportes.json', 'utf8'));
    res.json(data);
});

app.get("/editar", (req, res) => {
    const { nombre, precio } = req.query;
    if (nombre && precio) {
        const data = JSON.parse(fs.readFileSync('Deportes.json', 'utf8'));
        const deportes = data.deportes;
        const deporte = deportes.find(d => d.nombre === nombre);
        if (deporte) {
            deporte.precio = precio;
            fs.writeFileSync('Deportes.json', JSON.stringify(data, null, 2))
            res.send("Precio actualizado.")
        } else {
            res.status(404).send(`Deporte ${nombre} no encontrado.`);
        }
    } else {
        res.status(400).send("Nombre del deporte o nuevo precio no proporcionado.");
    }
});

app.get("/eliminar", (req, res) => {
    const { nombre } = req.query;
    if (nombre) {
        const data = JSON.parse(fs.readFileSync('Deportes.json', 'utf8'));
        const deportes = data.deportes
        const index = deportes.findIndex(d => d.nombre === nombre)
        if (index !== -1) {
            try {
                deportes.splice(index, 1)
                fs.writeFileSync('Deportes.json', JSON.stringify(data, null, 2));
                res.send(`${nombre} eliminado con éxito.`);
            } catch (error) {
                res.status(500).send("Error al eliminar el deporte o el deporte no existe.");
            }
        } else {
            res.status(400).send("Deporte no encontrado o no proporcionado.");
        }
    }
});

app.listen(3000, () => {
    console.log("Servidor inicializado en el puerto 3000.")
});