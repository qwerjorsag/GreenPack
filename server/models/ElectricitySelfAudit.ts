import mongoose from "mongoose";

const ElectricitySelfAuditSchema = new mongoose.Schema(
  {
    profile: { type: String, required: true },
    language: { type: String, default: "cs" },
    answers: { type: Map, of: Number, default: {} },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ElectricitySelfAuditModel =
  mongoose.models.ElectricitySelfAudit ||
  mongoose.model("ElectricitySelfAudit", ElectricitySelfAuditSchema, "electricityselfaudit");
