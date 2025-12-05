import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface BuildInterviewConfigOptionProps {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export function BuildInterviewConfigOption({
  id,
  value,
  label,
  description,
}: BuildInterviewConfigOptionProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-3 py-2 hover:bg-muted/40">
      <RadioGroupItem id={id} value={value} />
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
