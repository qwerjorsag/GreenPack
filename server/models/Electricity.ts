import mongoose from 'mongoose';

const PeriodSchema = new mongoose.Schema({
  id: { type: String, required: true },
  period: { type: String },
  occupancyRate: { type: Number },
  operatingDays: { type: Number },
  rooms: { type: Number },
  floorArea: { type: Number },
}, { _id: false });

const ElectricitySchema = new mongoose.Schema({
  profile: { type: String, required: true },
  periods: { type: [PeriodSchema], required: true },
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'electricity' });

export const ElectricityModel = mongoose.model('Electricity', ElectricitySchema);
