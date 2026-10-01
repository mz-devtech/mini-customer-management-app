import { Sparkles, UserPlus } from "lucide-react";

export default function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="hero">
      <div>
        <span className="pill">
          <Sparkles size={13} /> CRM Dashboard
        </span>
        <h1>
          Customer <span className="grad">Hub</span>
        </h1>
        <p>Manage your customers in one clean place.</p>
      </div>
      <button className="btn primary big" onClick={onAdd}>
        <UserPlus size={18} /> Add Customer
      </button>
    </header>
  );
}