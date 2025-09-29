import mongoose, { Schema, InferSchemaType } from 'mongoose';

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export type NoteDoc = InferSchemaType<typeof NoteSchema> & { _id: mongoose.Types.ObjectId };

export const NoteModel = mongoose.models.Note || mongoose.model('Note', NoteSchema);
