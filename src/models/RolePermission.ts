import { type Document, type Model, Schema, model, models, Types } from "mongoose";

export interface IRolePermission extends Document {
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
  createdAt: Date;
}

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  { timestamps: true }
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const RolePermission: Model<IRolePermission> =
  models.RolePermission || model<IRolePermission>("RolePermission", rolePermissionSchema);

export default RolePermission;
