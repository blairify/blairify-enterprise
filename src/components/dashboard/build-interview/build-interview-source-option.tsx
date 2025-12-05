import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface BuildInterviewSourceOptionProps {
  id: string;
  value: string;
  label: string;
  description: string;
}

export function BuildInterviewSourceOption({
  id,
  value,
  label,
  description,
}: BuildInterviewSourceOptionProps) {
  return (
    <div className="flex flex-1 items-start gap-3 rounded-lg border px-3 py-2 hover:bg-muted/40">
      <RadioGroupItem id={id} value={value} />
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
