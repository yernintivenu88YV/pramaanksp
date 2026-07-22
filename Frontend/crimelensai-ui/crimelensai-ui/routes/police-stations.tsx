import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { Building2, MapPin, Phone } from "lucide-react";

const stations = [
  { name: "Cubbon Park PS", district: "Bengaluru City", officers: 84, phone: "+91 80 2234 1101", status: "Active" },
  { name: "Jayanagar PS", district: "Bengaluru City", officers: 62, phone: "+91 80 2634 1102", status: "Active" },
  { name: "Devaraja PS", district: "Mysuru", officers: 48, phone: "+91 821 244 3101", status: "Active" },
  { name: "Vidyanagar PS", district: "Hubballi Dharwad", officers: 41, phone: "+91 836 226 4101", status: "Active" },
  { name: "Camp PS", district: "Belagavi", officers: 39, phone: "+91 831 240 5101", status: "Active" },
  { name: "Tunga Nagar PS", district: "Shivamogga", officers: 32, phone: "+91 818 227 6101", status: "Maintenance" },
];

export const Route = createFileRoute("/police-stations")({
  component: PoliceStations,
  head: () => ({
    meta: [
      { title: "Police Stations — CrimeLensAI" },
      { name: "description", content: "Directory of 1100+ police stations across Karnataka." },
    ],
  }),
});

function PoliceStations() {
  return (
    <AppShell>
      <PageHeader title="Police Stations" subtitle="1,100+ stations connected across Karnataka" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stations.map((s) => (
          <div key={s.name} className="glass-card p-5 hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#2F80ED]/15 text-[#2F80ED]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold truncate">{s.name}</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-[color:var(--color-text-secondary)]">
                  <MapPin className="h-3 w-3" /> {s.district}
                </div>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.status === "Active" ? "bg-[#27AE60]/20 text-[#27AE60]" : "bg-[#F2994A]/20 text-[#F2994A]"}`}>{s.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-secondary)]">Officers</div>
                <div className="mt-0.5 text-lg font-extrabold tabular-nums">{s.officers}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-secondary)]">Contact</div>
                <div className="mt-0.5 flex items-center gap-1 text-xs"><Phone className="h-3 w-3" /> {s.phone}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
