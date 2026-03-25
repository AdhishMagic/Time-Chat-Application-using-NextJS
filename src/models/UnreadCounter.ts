import { type Document, type Model, Schema, Types, model, models } from "mongoose";

export interface IUnreadCounter extends Document {
  userId: Types.ObjectId;
  conversationId: Types.ObjectId;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const unreadCounterSchema = new Schema<IUnreadCounter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    unreadCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

unreadCounterSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

const UnreadCounter: Model<IUnreadCounter> =
  (models.UnreadCounter as Model<IUnreadCounter>) ||
  model<IUnreadCounter>("UnreadCounter", unreadCounterSchema);

export default UnreadCounter;
