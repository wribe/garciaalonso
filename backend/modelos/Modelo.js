import mongoose from 'mongoose'

const modeloSchema = new mongoose.Schema({
    matricula: { type: String, required: true, unique: true, index: true },
    marca: { type: String, required: false },
    modelo: { type: String, required: false },
    año: { type: Number, required: false },
    km: { type: Number, required: false },
    precio: { type: Number, required: false },
    imagen: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
})

modeloSchema.pre('save', function (next) {
    if (this.matricula) this.matricula = this.matricula.trim().toUpperCase()
    next()
})

const Modelo = mongoose.models.Modelo || mongoose.model('Modelo', modeloSchema)
export default Modelo