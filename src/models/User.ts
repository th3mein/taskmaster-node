import mongoose, { CallbackError, Document, Schema } from "mongoose";

import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  password: string;
  roles: string[];
  active: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ["Employee"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
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

// Hash the password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
