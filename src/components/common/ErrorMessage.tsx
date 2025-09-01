
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  onDismiss, 
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`p-4 bg-red-100 border border-red-300 rounded-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">⚠️</span>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
