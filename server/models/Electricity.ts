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
  operationalData: {
    year1: { type: PeriodSchema, required: true },
    year2: { type: PeriodSchema, required: true },
    year3: { type: PeriodSchema, required: true },
  },
  energyByPeriod: {
    year1: { type: Map, of: Number, default: {} },
    year2: { type: Map, of: Number, default: {} },
    year3: { type: Map, of: Number, default: {} },
  },
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'electricity' });

export const ElectricityModel = mongoose.model('Electricity', ElectricitySchema);
