import { Users, MapPin, Clock } from "lucide-react";

type Props = { total: number; cities: number; latest: string };

export default function StatsCards({ total, cities, latest }: Props) {
  const items = [
    { label: "Total Customers", value: total, icon: <Users size={22} /> },
    { label: "Cities", value: cities, icon: <MapPin size={22} /> },
    { label: "Latest Added", value: latest, icon: <Clock size={22} />, small: true },
  ];
  return (
    <section className="stats">
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat-ic">{s.icon}</div>
          <div className="stat-txt">
            <small>{s.label}</small>
            <b className={s.small ? "trunc" : ""}>{s.value}</b>
          </div>
        </div>
      ))}
    </section>
  );
}