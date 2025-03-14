/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose, { Document, ObjectId, Schema } from "mongoose";

// @ts-expect-error
import Inc from "mongoose-sequence"; // Import plugin

export interface INote extends Document {
  user: ObjectId;
  title: string;
  text: string;
  completed: boolean;
}

const NoteSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id; // Add `id` field
        delete ret._id; // Remove `_id`
        delete ret.__v; // Remove version key
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const AutoIncrement = Inc(mongoose);
// Inc(NoteSchema);
// const AutoIncrement = Inc(NoteSchema);
NoteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});
export default mongoose.model<INote>("Note", NoteSchema);
