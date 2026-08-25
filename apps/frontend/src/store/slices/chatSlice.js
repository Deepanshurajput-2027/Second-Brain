import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessageApi } from '../../api/chatApi';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text, { rejectWithValue }) => {
    try {
      const response = await sendMessageApi(text);
      return response; // Expected { role: 'ai', content: '...' }
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        data: error.response?.data || error.message
      });
    }
  }
);

const initialState = {
  messages: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isChatOpen: false,
  draftQuery: '', // For pre-filling the chat input
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChatWindow: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    addMessageOptimistic: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setDraftQuery: (state, action) => {
      state.draftQuery = action.payload;
    },
    clearDraftQuery: (state) => {
      state.draftQuery = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        
        let content = 'Sorry, I encountered an error processing your request.';
        if (action.payload?.status === 503 || action.payload?.status === 429) {
          content = 'The AI is currently experiencing exceptionally high traffic. Please try asking again in a moment.';
        }
        
        state.messages.push({ role: 'ai', content });
      });
  }
});

export const { toggleChatWindow, addMessageOptimistic, clearMessages, setDraftQuery, clearDraftQuery } = chatSlice.actions;

export default chatSlice.reducer;
