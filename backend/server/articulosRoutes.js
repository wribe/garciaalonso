// server/articulosRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import Articulo from "../modelos/Articulo.js";
import { fileURLToPath } from "url";
import fs from 'fs';

// inicializar configuración de multer para manejo de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarse de que la carpeta uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Carpeta uploads creada automáticamente');
}

// Crear el router
const router = express.Router();
console.log("Router articulos cargado"); // para depurar



// Configuración de almacenamiento de multer en la carpeta uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); // ruta absoluta a server/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Inicializar multer
const upload = multer({ storage: storage });

// AHORA VIENEN LAS RUTAS USANDO EL router DE EXPRESS
// Obtener todos los artículo
router.get("/", async (req, res) => {
    const articulos = await Articulo.find();
    res.json(articulos);
});

// Guardar artículo con imagen
router.post("/", upload.single('imagen'), async (req, res) => {
    try {
        if (!req.body.vehiculo) {
            console.error("No se recibió el campo 'vehiculo'");
            return res.status(400).json({ error: "Campo 'vehiculo' vacío" });
        }

        let datos;
        try {
            datos = JSON.parse(req.body.vehiculo);
        } catch (e) {
            console.error("Error parseando JSON:", e.message);
            return res.status(400).json({ error: "JSON inválido en 'vehiculo'", detalle: e.message });
        }

        if (req.file) {
            datos.imagen = `/uploads/${req.file.filename}`;
        }

        const articulo = new Articulo(datos);
        const guardado = await articulo.save();
        res.json(guardado);

    } catch (err) {
        console.error("Error guardando artículo:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Obtener artículo por ID
router.get("/:id", async (req, res) => {
    try {
        const articulo = await Articulo.findById(req.params.id);
        if (!articulo) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        res.json(articulo);
    } catch (err) {
        console.error("Error obteniendo artículo:", err);
        res.status(500).json({ error: err.message });
    }
});

// Actualizar artículo
router.put("/:id", upload.single('imagen'), async (req, res) => {
    try {
        console.log('📝 PUT /api/articulos/:id recibido');
        console.log('ID:', req.params.id);
        console.log('Body:', req.body);
        console.log('File:', req.file);
        
        let datos;
        
        // Si viene como FormData con campo 'vehiculo'
        if (req.body.vehiculo) {
            try {
                datos = JSON.parse(req.body.vehiculo);
                console.log('✅ Datos parseados desde vehiculo:', datos);
            } catch (e) {
                console.error("Error parseando JSON:", e.message);
                return res.status(400).json({ error: "JSON inválido en 'vehiculo'", detalle: e.message });
            }
        } else {
            // Si viene como JSON directo
            datos = req.body;
            console.log('✅ Datos directos desde body:', datos);
        }

        // Si hay nueva imagen, actualizar la ruta
        if (req.file) {
            datos.imagen = `/uploads/${req.file.filename}`;
            console.log('🖼️ Nueva imagen:', datos.imagen);
        }

        console.log('🔄 Actualizando artículo con datos:', datos);

        const articuloActualizado = await Articulo.findByIdAndUpdate(
            req.params.id,
            datos,
            { new: true, runValidators: true }
        );

        if (!articuloActualizado) {
            console.error('❌ Artículo no encontrado con ID:', req.params.id);
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        console.log('✅ Artículo actualizado correctamente:', articuloActualizado._id);
        res.json(articuloActualizado);
    } catch (err) {
        console.error("Error actualizando artículo:", err);
        res.status(500).json({ error: err.message });
    }
});

// Eliminar artículo
router.delete("/:id", async (req, res) => {
    try {
        const articuloEliminado = await Articulo.findByIdAndDelete(req.params.id);
        
        if (!articuloEliminado) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        // Opcionalmente, eliminar la imagen del servidor
        if (articuloEliminado.imagen) {
            const imagePath = path.join(__dirname, articuloEliminado.imagen);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ mensaje: "Artículo eliminado correctamente", articulo: articuloEliminado });
    } catch (err) {
        console.error("Error eliminando artículo:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;