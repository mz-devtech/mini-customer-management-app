import { Search, X } from "lucide-react";

type Props = { value: string; onChange: (v: string) => void };

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search">
      <Search size={17} />
      <input
        type="text"
        placeholder="Search name, phone, email, city..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="clear" title="Clear" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}