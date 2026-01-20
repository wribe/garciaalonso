import express from 'express';
import * as authController from './authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-admin', authController.checkAdmin); // <-- Añade esta línea
router.get('/usuario', async (req, res) => {
    // Devuelve info del usuario autenticado o una lista de usuarios
    res.json({ message: "Ruta /api/usuario implementada" });
});

export default router;