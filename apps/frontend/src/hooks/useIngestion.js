import { useDispatch, useSelector } from 'react-redux';
import { ingestUrl } from '../store/slices/memorySlice';

export const useIngestion = () => {
  const dispatch = useDispatch();
  // Assuming your root reducer maps the slice to 'memory'
  const { isLoading, error } = useSelector((state) => state.memory); 

  const handleIngest = async (url) => {
    if (!url) return;
    
    try {
      await dispatch(ingestUrl(url)).unwrap();
    } catch (err) {
      console.error('Ingestion failed:', err);
    }
  };

  return {
    handleIngest,
    isLoading,
    error,
  };
};
