/**
 * Example Client Implementation
 * 
 * Shows how to consume the robust API endpoints from React components
 * with proper error handling and TypeScript typing
 */

import React from 'react';
import { useCallback, useState } from 'react';

/**
 * Types for API responses
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  text: string;
  messageType: 'text' | 'image' | 'file';
  isDeleted: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Service Class
 * Handles all communication with backend
 */
class MessageApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get default headers including authentication
   */
  private getHeaders(contentType = 'application/json'): HeadersInit {
    return {
      'Content-Type': contentType,
      'x-user-id': this.userId,
    };
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    text: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    clientMessageId?: string
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          conversationId,
          text,
          messageType,
          clientMessageId,
        }),
      });

      const data: ApiResponse<Message> = await response.json();

      if (!response.ok) {
        console.error('[API Error]', data);
        return data;
      }

      return data;
    } catch (error) {
      console.error('[Network Error]', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(
    conversationId: string,
    limit = 50,
    skip = 0
  ): Promise<
    ApiResponse<{
      messages: Message[];
      pagination: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
      };
    }>
  > {
    try {
      const params = new URLSearchParams({
        conversationId,
        limit: String(limit),
        skip: String(skip),
      });

      const response = await fetch(
        `${this.baseUrl}/messages?${params}`,
        {
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[API Error]', data);
        return data;
      }

      return data;
    } catch (error) {
      console.error('[Network Error]', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      const data: ApiResponse<Message> = await response.json();

      if (!response.ok) {
        console.error('[API Error]', data);
        return data;
      }

      return data;
    } catch (error) {
      console.error('[Network Error]', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: string,
    text: string
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/messages/edit/${messageId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ text }),
        }
      );

      const data: ApiResponse<Message> = await response.json();

      if (!response.ok) {
        console.error('[API Error]', data);
        return data;
      }

      return data;
    } catch (error) {
      console.error('[Network Error]', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
      };
    }
  }
}

/**
 * React Hook: useMessages
 * 
 * Manages message state and API calls
 */
function useMessages(conversationId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    skip: 0,
    hasMore: false,
  });

  const api = new MessageApiService(userId);

  /**
   * Fetch messages
   */
  const fetchMessages = useCallback(
    async (skip = 0) => {
      setLoading(true);
      setError(null);

      const response = await api.getMessages(conversationId, 50, skip);

      if (!response.success) {
        setError(response.error || 'Failed to load messages');
        setLoading(false);
        return;
      }

      setMessages(response.data!.messages);
      setPagination(response.data!.pagination);
      setLoading(false);
    },
    [api, conversationId]
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setError('Message cannot be empty');
        return false;
      }

      const clientMessageId = `${Date.now()}-${Math.random()}`;
      const response = await api.sendMessage(
        conversationId,
        text,
        'text',
        clientMessageId
      );

      if (!response.success) {
        setError(response.error || 'Failed to send message');
        return false;
      }

      // Add message optimistically
      setMessages([response.data!, ...messages]);
      return true;
    },
    [api, conversationId, messages]
  );

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      const response = await api.deleteMessage(messageId);

      if (!response.success) {
        setError(response.error || 'Failed to delete message');
        return false;
      }

      // Update message locally
      setMessages(
        messages.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true } : m
        )
      );
      return true;
    },
    [api, messages]
  );

  /**
   * Edit a message
   */
  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      const response = await api.editMessage(messageId, newText);

      if (!response.success) {
        setError(response.error || 'Failed to edit message');
        return false;
      }

      // Update message locally
      setMessages(
        messages.map((m) =>
          m._id === messageId
            ? { ...m, text: newText, editedAt: new Date() }
            : m
        )
      );
      return true;
    },
    [api, messages]
  );

  return {
    messages,
    loading,
    error,
    pagination,
    fetchMessages,
    sendMessage,
    deleteMessage,
    editMessage,
  };
}

/**
 * Example: Chat Component Using Hooks
 */
export function ChatComponent() {
  const conversationId = 'your-conversation-id';
  const userId = 'your-user-id';

  const {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    deleteMessage,
    editMessage,
  } = useMessages(conversationId, userId);

  // Load messages on mount
  React.useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  const handleSendMessage = async (text: string) => {
    const success = await sendMessage(text);
    if (success) {
      // Clear input field
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    await editMessage(messageId, newText);
  };

  return (
    <div className="chat-container">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => fetchMessages()}>Retry</button>
        </div>
      )}

      <div className="messages-list">
        {loading && <div className="loading">Loading messages...</div>}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.isDeleted ? 'deleted' : ''}`}
          >
            <div className="message-header">
              <strong>{message.senderId.username}</strong>
              {message.editedAt && <span className="edited">(edited)</span>}
            </div>

            <div className="message-body">
              {message.isDeleted ? (
                <em>Message deleted</em>
              ) : (
                message.text
              )}
            </div>

            <div className="message-actions">
              {message.senderId._id === userId && !message.isDeleted && (
                <>
                  <button
                    onClick={() => {
                      const newText = prompt('Edit message:', message.text);
                      if (newText) handleEditMessage(message._id, newText);
                    }}
                  >
                    Edit
                  </button>
                </>
              )}

              {message.senderId._id === userId && (
                <button
                  onClick={() => handleDeleteMessage(message._id)}
                >
                  Delete
                </button>
              )}
            </div>

            <div className="message-meta">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input') as HTMLInputElement;
            handleSendMessage(input.value);
            input.value = '';
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Export Types and Service
 */
export type { ApiResponse, Message };
export { MessageApiService, useMessages };
