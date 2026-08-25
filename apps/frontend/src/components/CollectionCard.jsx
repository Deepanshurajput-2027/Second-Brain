import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { selectCollectionItemCount } from '../store/slices/collectionSlice';
import { useCollections } from '../hooks/useCollections';
import { toast } from 'react-hot-toast';

export const CollectionCard = ({ collection }) => {
  const navigate = useNavigate();
  const { removeCollection } = useCollections();
  const collectionId = collection.id || collection._id;
  const count = useSelector((state) => selectCollectionItemCount(state, collectionId));

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete the collection "${collection.name}"?`)) {
      try {
        console.log('[CollectionCard] Deleting collection:', collectionId);
        await removeCollection(collectionId);
        toast.success('Collection deleted');
      } catch (error) {
        console.error('[CollectionCard] Delete error:', error);
        toast.error('Failed to delete collection');
      }
    }
  };

  return (
    <div 
      onClick={() => navigate(`/collections/${collectionId}`)}
      className="break-inside-avoid mb-6 w-full border border-gray-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col group relative"
    >
      {/* Top Graphic / Collage */}
      <div className="h-48 w-full flex gap-1 p-1 bg-slate-50 relative">
        <div className="w-2/3 h-full bg-emerald-50 rounded-l-lg flex items-center justify-center overflow-hidden transition-colors group-hover:bg-emerald-100/50">
          <ImageIcon className="w-8 h-8 text-emerald-200" />
        </div>
        <div className="w-1/3 h-full flex flex-col gap-1">
          <div className="h-1/2 w-full bg-emerald-100 rounded-tr-lg flex items-center justify-center overflow-hidden transition-colors group-hover:bg-emerald-200/50">
             <ImageIcon className="w-6 h-6 text-emerald-200/70" />
          </div>
          <div className="h-1/2 w-full bg-emerald-50 rounded-br-lg flex items-center justify-center overflow-hidden transition-colors group-hover:bg-emerald-100/50">
             <ImageIcon className="w-6 h-6 text-emerald-100" />
          </div>
        </div>

        {/* Delete Quick Action */}
        <button
          type="button"
          title="Delete Collection"
          aria-label={`Delete ${collection.name}`}
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Card Info */}
      <div className="p-4 flex flex-col justify-center border-t border-gray-50 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-800 font-bold text-lg leading-tight line-clamp-1">{collection.name}</h3>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>
        {collection.description && (
          <p className="text-slate-500 text-sm line-clamp-2">{collection.description}</p>
        )}
      </div>
    </div>
  );
};

