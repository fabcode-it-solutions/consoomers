/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';

interface Tester {
  testerId: string;
  name: string;
  avatar?: string;
  likedAt: string;
}

interface ProductLikesProps {
  handle: string;
}

const ProductLikes: React.FC<ProductLikesProps> = ({ handle }) => {
  const [likes, setLikes] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/product/get-product/${handle}/like`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes || []);
        // Set isLiked based on whether the current user has liked the product
        setIsLiked(data.userLiked || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsLiked(!isLiked);
    
    try {
      const res = await fetch(`/api/product/get-product/${handle}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchLikes();
      }
    } catch (err) {
      console.error(err);
      setIsLiked(!isLiked);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [handle]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse"></div>
        <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isAnimating}
          className={`relative group transition-transform ${
            isAnimating ? 'scale-125' : 'hover:scale-110'
          }`}
        >
          <Heart
            className={`w-7 h-7 transition-all duration-300 ${
              isLiked
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-slate-400 hover:text-red-400'
            }`}
          />
          {isAnimating && (
            <div className="absolute inset-0 animate-ping">
              <Heart className="w-7 h-7 text-red-500 opacity-75" />
            </div>
          )}
        </button>

        {/* Likes Count */}
        {/* <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 group"
        >
         
          {likes.length > 0 && (
            <div className="flex -space-x-2">
              {likes.slice(0, 3).map((tester, idx) => (
                <div
                  key={tester.testerId}
                  className="relative ring-2 ring-slate-900 rounded-full transition-transform group-hover:scale-110"
                  style={{ zIndex: 3 - idx }}
                >
                  {tester.avatar ? (
                    <img
                      src={tester.avatar}
                      alt={tester.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {tester.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        
          <span className="text-sm font-sofia-sans text-slate-300 group-hover:text-blue-400 transition-colors">
            {likes.length === 0 ? (
              'Be the first to like'
            ) : likes.length === 1 ? (
              <span>
                Liked by <span className="font-semibold">{likes[0].name}</span>
              </span>
            ) : likes.length === 2 ? (
              <span>
                Liked by <span className="font-semibold">{likes[0].name}</span> and{' '}
                <span className="font-semibold">1 other</span>
              </span>
            ) : (
              <span>
                Liked by <span className="font-semibold">{likes[0].name}</span> and{' '}
                <span className="font-semibold">{likes.length - 1} others</span>
              </span>
            )}
          </span>
        </button> */}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-50 font-sofia-sans">
                Likes
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {likes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Heart className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-sofia-sans">No likes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {likes.map((tester) => (
                    <div
                      key={tester.testerId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Avatar */}
                      {tester.avatar ? (
                        <img
                          src={tester.avatar}
                          alt={tester.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold ring-2 ring-slate-700">
                          {tester.name?.charAt(0) || '?'}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-50 font-sofia-sans truncate">
                          {tester.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-slate-400 font-sofia-sans">
                          {formatTimeAgo(tester.likedAt)}
                        </p>
                      </div>

                      {/* Like Icon */}
                      <Heart className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductLikes;