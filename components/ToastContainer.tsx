import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { ToastItem } from "@/hooks/useToast";

const icons = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  info: <Trash2 size={20} />,
};

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type]}
          {t.text}
        </div>
      ))}
    </div>
  );
}