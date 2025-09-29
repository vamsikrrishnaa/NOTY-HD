import mongoose, { Schema, InferSchemaType } from 'mongoose';

const OtpSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['signup', 'login'], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    ip: { type: String, required: false },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export type OtpDoc = InferSchemaType<typeof OtpSchema> & { _id: mongoose.Types.ObjectId };

export const OtpModel = mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
