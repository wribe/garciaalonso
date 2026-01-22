// modelos/Cita.js
import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    movil_cliente: {
        type: String,
        required: true,
        trim: true
    },
    fecha_cita: {
        type: Date,
        required: true
    },
    servicio_taller: {
        type: String,
        required: true,
        enum: ['revision', 'prelTV', 'neumaticos', 'frenos', 'cambioAceite']
    },
    estado_cita: {
        type: String,
        required: true,
        enum: ['pendiente', 'finalizado'],
        default: 'pendiente'
    },
    acepta: {
        type: Boolean,
        default: false
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

const Cita = mongoose.model('Cita', citaSchema);

export default Cita;
