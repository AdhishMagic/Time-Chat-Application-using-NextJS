import { type Document, type Model, Schema, model, models } from "mongoose";

export interface IPermission extends Document {
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    action: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
  },
  { timestamps: true }
);

const Permission: Model<IPermission> =
  models.Permission || model<IPermission>("Permission", permissionSchema);

export default Permission;
