import mongoose from 'mongoose'

const ventaSchema = new mongoose.Schema({
    modeloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Modelo' },
    matricula: String,
    marca: String,
    modelo: String,
    año: Number,
    km: Number,
    precio: Number,
    imagen: String,
    disponible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
})

const ModeloVenta = mongoose.models.ModeloVenta || mongoose.model('ModeloVenta', ventaSchema)
export default ModeloVenta