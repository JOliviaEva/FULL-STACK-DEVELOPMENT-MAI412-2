import { LayoutDashboard, Sparkles, Zap, Atom, Database } from "lucide-react";
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
    title: "Lab 2 — HTML5 APIs",
    status: "Completed",
    description: "HTML5 APIs Integration",
    icon: Sparkles,
    href: "/lab-2",
  },
  {
    index: 3,
    entry: "03 & 04",
    title: "Labs 3 & 4 — JavaScript Events",
    status: "Completed",
    description: "Interactive event handling: scroll, mousemove, input, keydown, focus, blur, change, submit, drag/drop, contextmenu & resize.",
    icon: Zap,
    href: "/lab-3-4",
    linkText: "View Labs 3 & 4",
  },
  {
    index: 5,
    entry: "05 & 06",
    title: "Labs 5 & 6 — React CRUD",
    status: "Completed",
    description: "UniAI Admissions Desk in React: reusable components, useState, form handling and full CRUD on JSON Server, with live search.",
    icon: Atom,
    href: "/lab-5-6",
    linkText: "View Labs 5 & 6",
  },
  {
    index: 7,
    title: "Lab 7 — MERN Stack",
    status: "Completed",
    description: "The Admissions Desk on a real backend: an Express.js REST API with Mongoose models storing applications in MongoDB, with full CRUD and search.",
    icon: Database,
    href: "/lab-7",
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
          Four entries in the notebook &mdash; all built and running.
        </p>
      </div>

      <Divider className="mb-10" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => (
          <LabCard key={lab.index} {...lab} />
        ))}
      </div>
    </section>
  );
}
