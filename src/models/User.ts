import { type Document, type Model, Schema, model, models } from "mongoose";

export type UserStatus = "online" | "offline";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  status: UserStatus;
  lastSeen?: Date;
  lastMessageSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
      required: true,
    },
    lastSeen: { type: Date, default: null },
    lastMessageSentAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
