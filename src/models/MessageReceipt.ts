import { type Document, type Model, Schema, Types, model, models } from "mongoose";

export interface IMessageReceipt extends Document {
  messageId: Types.ObjectId;
  userId: Types.ObjectId;
  deliveredAt?: Date;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageReceiptSchema = new Schema<IMessageReceipt>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageReceiptSchema.index({ userId: 1, messageId: 1 });

const messageReceiptTtlSeconds = Number(
  process.env.MESSAGE_RECEIPT_TTL_SECONDS ?? "0",
);

if (Number.isFinite(messageReceiptTtlSeconds) && messageReceiptTtlSeconds > 0) {
  messageReceiptSchema.index(
    { seenAt: 1 },
    {
      expireAfterSeconds: messageReceiptTtlSeconds,
      partialFilterExpression: { seenAt: { $type: "date" } },
    },
  );
}

const MessageReceipt: Model<IMessageReceipt> =
  (models.MessageReceipt as Model<IMessageReceipt>) ||
  model<IMessageReceipt>("MessageReceipt", messageReceiptSchema);

export default MessageReceipt;
