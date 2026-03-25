import { type Document, type Model, Schema, model, models } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["user", "admin", "moderator"],
    },
    description: String,
  },
  { timestamps: true }
);

const Role: Model<IRole> = models.Role || model<IRole>("Role", roleSchema);
export default Role;
