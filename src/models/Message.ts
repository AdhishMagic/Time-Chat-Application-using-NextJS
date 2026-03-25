import { type Document, type Model, Schema, Types, model, models } from "mongoose";

export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  clientMessageId?: string;
  text?: string;
  mediaUrl?: string;
  messageType: MessageType;
  isDeleted: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientMessageId: {
      type: String,
      trim: true,
      default: null,
      maxlength: 128,
    },
    text: {
      type: String,
      trim: true,
      default: null,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
    optimisticConcurrency: true,
  },
);

messageSchema.index({ conversationId: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ conversationId: "hashed" });
messageSchema.index(
  { clientMessageId: 1, senderId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $type: "string" } },
  },
);

const Message: Model<IMessage> =
  (models.Message as Model<IMessage>) || model<IMessage>("Message", messageSchema);

export default Message;
