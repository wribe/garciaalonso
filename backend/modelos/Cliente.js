import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    dni: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    movil: { type: String, required: true, unique: true, index: true },
    direccion: { type: String, required: false },
    passwordHash: { type: String, required: true },
    rol: { type: String, enum: ['user', 'admin'], default: 'user' },
    activo: { type: Boolean, default: true },
    fecha_alta: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
})

clienteSchema.pre('save', async function (next) {
    if (this.isModified('nombre') && this.nombre) {
        this.nombre = this.nombre.trim().replace(/\s+/g, ' ').split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }
    if (this.isModified('dni') && this.dni) {
        this.dni = this.dni.trim().toUpperCase()
    }
    if (this.isModified('direccion') && this.direccion) {
        this.direccion = this.direccion.trim().toUpperCase()
    }
    if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10)
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    }
    next()
})

clienteSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.passwordHash)
}

const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema)
export default Cliente