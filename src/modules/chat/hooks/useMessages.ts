import { useCallback, useState, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { sendMessageAction } from '@/actions/message/send-message.action';
import { getMessagesAction } from '@/actions/message/get-messages.action';

const ERROR_MESSAGES: Record<string, string> = {
  'Message cannot be empty': 'Please enter a message',
  'Unauthorized': 'You are not logged in',
  'Forbidden': 'You do not have permission',
  'Not found': 'Conversation not found',
};

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
};

export function useMessages() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  const mergeMessages = useChatStore((state) => state.mergeMessages);
  const activeConversationId = useChatStore((state) => state.activeConversationId);

  useEffect(() => {
    setError(null);
  }, [activeConversationId]);

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      setError(null);
      setIsLoading(true);

      try {
        if (!text?.trim()) {
          throw new Error('Message cannot be empty');
        }

        const result = await sendMessageAction({ conversationId, text });

        if (!result?.success) {
          throw new Error(result?.error || 'Failed to send');
        }

        if (result.data) {
          addMessage(result.data);
        }
        return result.data || null;
      } catch (err) {
        const errorMessage = getSafeErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  const fetchMessages = useCallback(
    async (conversationId: string, limit = 50, offset = 0) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await getMessagesAction({
          conversationId,
          limit,
          offset,
        });

        if (!result?.success) {
          throw new Error(result?.error || 'Failed to load');
        }

        if (!Array.isArray(result.data)) {
          setMessages([]);
          return [];
        }

        if (offset === 0) {
          setMessages(result.data);
        } else {
          mergeMessages(result.data);
        }

        return result.data;
      } catch (err) {
        const errorMessage = getSafeErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages, mergeMessages]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    fetchMessages,
  };
}
