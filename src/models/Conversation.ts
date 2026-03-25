import { type Document, type Model, Schema, Types, model, models } from "mongoose";

export interface IConversationParticipantSnapshot {
  userId: Types.ObjectId;
  username: string;
  avatar?: string;
}

export interface IConversationUserPreference {
  userId: Types.ObjectId;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
}

export interface IConversation extends Document {
  members: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: Types.ObjectId;
  lastMessagePreview?: string;
  lastMessageAt?: Date;
  participantsSnapshot: IConversationParticipantSnapshot[];
  userPreferences: IConversationUserPreference[];
  createdAt: Date;
  updatedAt: Date;
}

const participantSnapshotSchema = new Schema<IConversationParticipantSnapshot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const conversationUserPreferenceSchema = new Schema<IConversationUserPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
      required: true,
    },
    muted: {
      type: Boolean,
      default: false,
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
      required: true,
    },
    groupName: {
      type: String,
      trim: true,
      default: null,
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastMessagePreview: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    // Denormalized user profile fields for fast conversation list reads.
    // Keep this snapshot in sync from profile update flows.
    participantsSnapshot: {
      type: [participantSnapshotSchema],
      default: [],
    },
    userPreferences: {
      type: [conversationUserPreferenceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation: Model<IConversation> =
  (models.Conversation as Model<IConversation>) ||
  model<IConversation>("Conversation", conversationSchema);

export default Conversation;
