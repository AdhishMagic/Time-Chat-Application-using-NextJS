import { type Document, type Model, Schema, Types, model, models } from "mongoose";

export type ArchivedMessageType = "text" | "image" | "file";

export interface IMessageArchive extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  clientMessageId?: string;
  text?: string;
  mediaUrl?: string;
  messageType: ArchivedMessageType;
  isDeleted: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageArchiveSchema = new Schema<IMessageArchive>(
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
  },
);

messageArchiveSchema.index({ conversationId: 1 });
messageArchiveSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });

const MessageArchive: Model<IMessageArchive> =
  (models.MessageArchive as Model<IMessageArchive>) ||
  model<IMessageArchive>("MessageArchive", messageArchiveSchema);

export default MessageArchive;
