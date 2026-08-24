import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ingestMemory, uploadMemory, checkMemoryStatus } from '../store/slices/memorySlice';
import { useToast } from '../components/ToastProvider';

export const useMemoryIngester = () => {
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const toast = useToast();
  
  // Interface with Redux slice's loading states
  const { ingestStatus } = useSelector((state) => state.memory);
  const isIngesting = ingestStatus === 'loading';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setUrl(''); // Clear URL if file is selected
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pollStatus = (memoryId, isFile = false) => {
    const maxRetries = 30; // 1 minute at 2s intervals
    let attempts = 0;
    
    const intervalId = setInterval(async () => {
      try {
        attempts++;
        const result = await dispatch(checkMemoryStatus(memoryId)).unwrap();
        
        if (result.aiStatus === 'completed') {
          clearInterval(intervalId);
          toast.success(isFile ? 'File processed and saved successfully!' : 'Memory saved and summarized!');
        } else if (result.aiStatus === 'failed') {
          clearInterval(intervalId);
          toast.error('AI processing failed. Please try again.');
        } else if (attempts >= maxRetries) {
          clearInterval(intervalId);
          toast.error('Processing is taking too long. It will continue in the background.');
        }
      } catch (err) {
        clearInterval(intervalId);
        console.error('Error polling status', err);
      }
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFile) {
      try {
        const result = await dispatch(uploadMemory(selectedFile)).unwrap();
        // Upload successful, start polling
        toast.success('File uploaded! AI is analyzing it in the background...');
        if (result.id || result._id) {
          pollStatus(result.id || result._id, true);
        }
        clearFile();
      } catch (err) {
        toast.error(typeof err === 'string' ? err : err?.message || 'Failed to process file with AI');
      }
      return;
    }

    if (!url.trim()) return;
    
    try {
      const result = await dispatch(ingestMemory(url)).unwrap();
      setUrl('');
      toast.success('Link saved! AI is analyzing it in the background...');
      if (result.id || result._id) {
        pollStatus(result.id || result._id, false);
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to process URL');
    }
  };

  return {
    url,
    setUrl,
    selectedFile,
    handleFileChange,
    clearFile,
    fileInputRef,
    isIngesting,
    handleSubmit
  };
};
