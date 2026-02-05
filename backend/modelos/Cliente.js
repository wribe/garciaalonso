import mongoose from 'mongoose'

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String },
  dni: { type: String, required: true, unique: true, uppercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  movil: { type: String, required: true, unique: true },
  direccion: { type: String },
  provincia: { type: String },
  municipio: { type: String },
  passwordHash: { type: String },
  fecha_alta: { type: Date, default: Date.now },
  tipo: { type: String, enum: ['user', 'admin'], default: 'user' },
  activo: { type: Boolean, default: true },
  historico: { type: Boolean, default: false },
  lopd: { type: Boolean, default: false }
}, { timestamps: true })

// Indexes: unique constraints are defined on the fields (unique: true)
// Avoid duplicating indexes via both field definitions and schema.index()

const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema)
export default Cliente
