import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  sendMessage as sendMessageThunk,
  addMessageOptimistic,
  toggleChatWindow,
  clearMessages,
  setDraftQuery as setDraftQueryAction,
  clearDraftQuery as clearDraftQueryAction
} from '../store/slices/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch();
  const { messages, status, error, isChatOpen, draftQuery } = useSelector((state) => state.chat);

  const handleSendMessage = useCallback(async (text) => {
    // 1. Optimistically add user message
    dispatch(addMessageOptimistic({ role: 'user', content: text }));
    
    // 2. Dispatch thunk to get AI response
    try {
      await dispatch(sendMessageThunk(text)).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [dispatch]);

  const toggleChat = useCallback(() => {
    dispatch(toggleChatWindow());
  }, [dispatch]);

  const clearChat = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const setDraftQuery = useCallback((query) => {
    dispatch(setDraftQueryAction(query));
  }, [dispatch]);

  const clearDraftQuery = useCallback(() => {
    dispatch(clearDraftQueryAction());
  }, [dispatch]);

  return {
    messages,
    isLoading: status === 'loading',
    error,
    isChatOpen,
    draftQuery,
    sendMessage: handleSendMessage,
    toggleChat,
    clearChat,
    setDraftQuery,
    clearDraftQuery
  };
};
