import { LayoutDashboard, Database, ServerCog, BrainCircuit } from "lucide-react";
import LabCard from "./LabCard.jsx";
import Divider from "./Divider.jsx";

const labs = [
  {
    index: 1,
    title: "Lab 1 — Responsive Webpage",
    status: "Completed",
    description: "Built a responsive university ERP webpage using Tailwind CSS.",
    icon: LayoutDashboard,
    href: "/lab-1",
  },
  {
    index: 2,
    title: "Lab 2",
    status: "In Progress",
    icon: Database,
  },
  {
    index: 3,
    title: "Lab 3",
    status: "In Progress",
    icon: ServerCog,
  },
  {
    index: 4,
    title: "Lab 4",
    status: "In Progress",
    icon: BrainCircuit,
  },
];

export default function LabProgress() {
  return (
    <section id="progress" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="stamp-label mb-3">Lab Journal</p>
        <h2 className="font-serif text-2xl font-semibold text-plum-500 sm:text-3xl">
          Progress so far
        </h2>
        <p className="mt-3 text-ink-soft">
          Four entries in the notebook &mdash; one built and running, three
          waiting on the next page.
        </p>
      </div>

      <Divider className="mb-10" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {labs.map((lab) => (
          <LabCard key={lab.index} {...lab} />
        ))}
      </div>
    </section>
  );
}
