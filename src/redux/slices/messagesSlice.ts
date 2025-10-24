import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
import { RootState } from "../store";

// Types
export interface Message {
  id?: string;
  conversation_id?: string;
  sender_id?: string;
  receiver_id?: string;
  advisor_id?: string;
  content: string;
  message_type?: string; // text, image, file, etc.
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  receiver?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message?: Message;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
  participants?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  }>;
}

export interface SendMessageData {
  receiver_id: string;
  content: string;
  advisor_id?: string;
  message_type?: string;
}

export interface SendMessageFromProfileData {
  advisor_id?: string;
  content: string;
  message_type?: string;
  profile_id?: string;
}

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status: number;
  };
}

// Initial state
const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  success: null,
};

// Send a message
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (messageData: SendMessageData, { rejectWithValue }) => {
    try {
      const response = await api.post("/messages", messageData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to send message"
      );
    }
  }
);

// Send message from advisor profile
export const sendMessageFromProfile = createAsyncThunk(
  "messages/sendMessageFromProfile",
  async (messageData: SendMessageFromProfileData, { rejectWithValue }) => {
    try {
      const response = await api.post("/messages/from-profile", messageData);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to send message from profile"
      );
    }
  }
);

// Get user conversations
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/messages/conversations");
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }
);

// Get messages in a conversation
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchConversationMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      return {
        conversationId,
        messages: response.data
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch conversation messages"
      );
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/conversations/${conversationId}/mark-read`);
      return {
        conversationId,
        data: response.data
      };
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark messages as read"
      );
    }
  }
);

// Messages slice
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessageToConversation: (state, action) => {
      const newMessage = action.payload;
      state.messages.push(newMessage);
      
      // Update the conversation's last message if this is the most recent
      if (state.currentConversation) {
        state.currentConversation.last_message = newMessage;
      }
    },
    updateMessageReadStatus: (state, action) => {
      const { conversationId, messageIds } = action.payload;
      
      // Update messages in the current conversation
      state.messages.forEach(message => {
        if (messageIds.includes(message.id)) {
          message.is_read = true;
        }
      });
      
      // Update conversation unread count
      if (state.currentConversation && state.currentConversation.id === conversationId) {
        state.currentConversation.unread_count = Math.max(0, (state.currentConversation.unread_count || 0) - messageIds.length);
      }
      
      // Update in conversations list
      const conversation = state.conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.unread_count = Math.max(0, (conversation.unread_count || 0) - messageIds.length);
      }
    },
  },
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Message sent successfully";
        // Add the new message to the current conversation
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send message from profile
    builder
      .addCase(sendMessageFromProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageFromProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Message sent successfully";
        // Add the new message to the current conversation
        state.messages.push(action.payload);
      })
      .addCase(sendMessageFromProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch conversation messages
    builder
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark messages as read
    builder
      .addCase(markMessagesAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "Messages marked as read";
        
        // Update messages in the current conversation
        state.messages.forEach(message => {
          if (message.conversation_id === action.payload.conversationId) {
            message.is_read = true;
          }
        });
        
        // Update conversation unread count
        if (state.currentConversation && state.currentConversation.id === action.payload.conversationId) {
          state.currentConversation.unread_count = 0;
        }
        
        // Update in conversations list
        const conversation = state.conversations.find(conv => conv.id === action.payload.conversationId);
        if (conversation) {
          conversation.unread_count = 0;
        }
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearMessages,
  clearError,
  clearSuccess,
  setCurrentConversation,
  addMessageToConversation,
  updateMessageReadStatus,
} = messagesSlice.actions;

// Export selectors
export const selectConversations = (state: RootState) => state.messages.conversations;
export const selectCurrentConversation = (state: RootState) => state.messages.currentConversation;
export const selectMessages = (state: RootState) => state.messages.messages;
export const selectMessagesLoading = (state: RootState) => state.messages.isLoading;
export const selectMessagesError = (state: RootState) => state.messages.error;
export const selectMessagesSuccess = (state: RootState) => state.messages.success;

// Additional selectors
export const selectUnreadConversations = (state: RootState) => 
  state.messages.conversations.filter(conversation => (conversation.unread_count || 0) > 0);

export const selectConversationById = (conversationId: string) => (state: RootState) =>
  state.messages.conversations.find(conversation => conversation.id === conversationId);

export const selectUnreadCount = (state: RootState) => 
  state.messages.conversations.reduce((total, conversation) => total + (conversation.unread_count || 0), 0);

export default messagesSlice.reducer; 