
// Reusable like button component
'use client';

interface LikeButtonProps {
  liked: boolean;
  likesCount: number;
  onLike: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function LikeButton({ 
  liked, 
  likesCount, 
  onLike, 
  disabled = false,
  size = 'md'
}: LikeButtonProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  return (
    <button
      onClick={onLike}
      disabled={disabled}
      className={`flex items-center space-x-1 transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : liked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-red-500'
      }`}
    >
      <svg 
        className={sizeClasses[size]} 
        fill={liked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className={textSizeClasses[size]}>{likesCount}</span>
    </button>
  );
}
