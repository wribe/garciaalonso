import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
    const { dni, password } = req.body;

    try {
        const respone = await axios.get(`http://localhost:3000/clientes?dni=${dni}`);
        const user = respone.data[0];

        if (!user) {return res.status(400).json({ message: "Usuario no encontrado" });}

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {return res.status(400).json({ message: "Usuario o Contraseña incorrecta" });}

        const token = jwt.sign(
            { dni: user.dni, tipo: user.tipo || "user" },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            token,
            nombre: user.nombre,
            tipo: user.tipo || "user"
        });
    }catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}