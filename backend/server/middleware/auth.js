import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'No token provided' })
    const token = auth.split(' ')[1]
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.user = payload
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export function adminMiddleware(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'No auth' })
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Admin only' })
    next()
}