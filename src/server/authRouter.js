import { verify } from "jsonwebtoken";
import { login } from "./authController.js";
import express from "express";

const router = express.Router();

router.post("/login", login);

router.get("/modelos", verificarToken, soloAdmin, (req, res) => {
    res.json({ message: `Hola ${req.user.dni}, estas autentificado` });
});

router.get("/clientes", verificarToken, soloAdmin, (req, res) => {
    res.json({ message: `Hola ${req.user.dni}, estas autentificado` });
});

router.get("/ventas", verificarToken, (req, res) => {
    res.json({ message: `Hola ${req.user.dni}, estas autentificado` });
});

router.get("/noticias", verificarToken, soloAdmin, (req, res) => {
    res.json({ message: `Hola ${req.user.dni}, estas autentificado` });
});

router.get("/citas", verificarToken, soloAdmin, (req, res) => {
    res.json({ message: `Hola ${req.user.dni}, estas autentificado` });
});

export default router;