// ⚠️ DEPRECATED: Chat service has been moved to the chat module for feature encapsulation
// This file serves as a backward compatibility re-export only
// New code should import from: @/modules/chat/services

export {
  createMessageWithConsistency,
  softDeleteMessageWithConsistency,
  editMessageWithOptimisticConcurrency,
  getWelcomeMessage,
  getServerTimeMessage,
} from '@/modules/chat/services/chat.service';

