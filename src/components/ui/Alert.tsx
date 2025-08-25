// src/components/ui/Alert.tsx
export default function Alert({ title, message, onRetry }:{
  title: string; message: string; onRetry?: ()=>void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="text-red-700 font-semibold mb-1">✖ {title}</div>
      <div className="text-sm text-red-700/90">{message}</div>
      {onRetry ? (
        <button onClick={onRetry} className="mt-3 btn btn-ghost">Reintentar</button>
      ) : null}
    </div>
  );
}
