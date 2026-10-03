import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-box">
      <AlertCircle size={36} />
      <h3>Something went wrong</h3>
      <p>{message}</p>
      <button className="btn" onClick={onRetry}>
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}