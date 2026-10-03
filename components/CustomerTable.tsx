import { Pencil, Trash2, Phone, Mail, Inbox, SearchX, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { Customer } from "@/lib/supabase";
import { gradientFor, initials } from "@/lib/utils";
import Highlight from "./Highlight";

type Props = {
  customers: Customer[];
  loading: boolean;
  query: string;
  highlightId: string | null;
  removingId: string | null;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
};

export default function CustomerTable({
  customers, loading, query, highlightId, removingId, onEdit, onDelete,
}: Props) {
  // the .scroll box has a fixed height and a Y scrollbar in every state
  if (loading)
    return (
      <div className="scroll">
        <div className="state">
          <Loader2 className="spin" size={30} />
          Loading customers...
        </div>
      </div>
    );

  if (customers.length === 0)
    return (
      <div className="scroll">
        <div className="state">
          {query ? <SearchX size={42} /> : <Inbox size={42} />}
          <p>{query ? `No customers match "${query}".` : "No customers yet. Add your first one!"}</p>
        </div>
      </div>
    );

  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr
              key={c.id}
              id={`row-${c.id}`}
              className={`${highlightId === c.id ? "flash" : ""} ${removingId === c.id ? "removing" : ""}`}
            >
              <td>
                <div className="who">
                  <span className="avatar" style={{ background: gradientFor(c.name) }}>
                    {initials(c.name)}
                  </span>
                  <Link href={`/customers/${c.id}`} className="name-link" title="View details">
                    <b><Highlight text={c.name} query={query} /></b>
                  </Link>
                </div>
              </td>
              <td>
                <div className="cell"><Phone size={14} /><Highlight text={c.phone} query={query} /></div>
              </td>
              <td>
                <div className="cell"><Mail size={14} /><Highlight text={c.email} query={query} /></div>
              </td>
              <td>
                <span className="tag"><Highlight text={c.city} query={query} /></span>
              </td>
              <td className="right">
                <Link href={`/customers/${c.id}`} className="icon" title="View details">
                  <Eye size={16} />
                </Link>
                <button className="icon" title="Edit" onClick={() => onEdit(c)}>
                  <Pencil size={16} />
                </button>
                <button className="icon del" title="Delete" onClick={() => onDelete(c)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}