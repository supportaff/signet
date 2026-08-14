import Link from "next/link";

const notes = [
  "Download the key before you leave this page.",
  "For many hosts: forge a Root CA, trust it once, then issue host certs.",
  "Put every hostname you will type into the host SANs.",
  "Never email a CA or host .key. Send a CSR only if a public CA must sign it.",
];

export function PracticeNotes() {
  return (
    <div className="mt-8 rounded-[28px] border border-line bg-surface p-5">
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm font-medium">Before you generate</p>
        <Link href="/#best-practices" className="text-sm text-wax hover:underline">
          All best practices
        </Link>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-wax" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
