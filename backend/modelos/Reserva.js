import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
    // Datos del vehículo reservado
    vehiculo: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Articulo', required: true },
        marca: { type: String, required: true },
        modelo: { type: String, required: true },
        matricula: { type: String },
        anio: { type: Number },
        precio: { type: Number }
    },
    
    // Datos del solicitante
    solicitante: {
        nombre: { type: String, required: true },
        apellidos: { type: String, required: true },
        dni: { type: String, required: true },
        email: { type: String, required: true },
        telefono: { type: String, required: true },
        direccion: { type: String },
        ciudad: { type: String },
        codigoPostal: { type: String }
    },
    
    // Datos de la reserva
    fechaReserva: {
        type: Date,
        default: Date.now
    },
    fechaExpiracion: {
        type: Date,
        default: function() {
            // La reserva expira en 7 días por defecto
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + 7);
            return fecha;
        }
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'expirada', 'completada'],
        default: 'pendiente'
    },
    observaciones: {
        type: String
    },
    metodoPagoPreferido: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'financiacion'],
        default: 'efectivo'
    },
    señal: {
        pagada: { type: Boolean, default: false },
        importe: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    collection: 'reservas'
});

// Índices para búsquedas eficientes
reservaSchema.index({ 'solicitante.dni': 1 });
reservaSchema.index({ 'solicitante.email': 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ fechaExpiracion: 1 });

const Reserva = mongoose.model('Reserva', reservaSchema);

export default Reserva;
