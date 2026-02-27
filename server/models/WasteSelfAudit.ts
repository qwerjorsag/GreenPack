import mongoose from "mongoose";

const WasteSelfAuditSchema = new mongoose.Schema(
  {
    profile: { type: String, required: true },
    language: { type: String, default: "cs" },
    answers: { type: Map, of: Number, default: {} },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WasteSelfAuditModel =
  mongoose.models.WasteSelfAudit ||
  mongoose.model("WasteSelfAudit", WasteSelfAuditSchema, "wasteselfaudit");
