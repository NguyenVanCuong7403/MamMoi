import { Label } from "@/components/ui/label";

export default function Field({ label, icon, children }) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5 text-neutral-700">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
