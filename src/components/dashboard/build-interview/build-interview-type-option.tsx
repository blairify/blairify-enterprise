interface BuildInterviewTypeOptionProps {
  id: string;
  name: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  shrinkToContent?: boolean;
}

export function BuildInterviewTypeOption({
  id,
  name,
  label,
  description,
  selected,
  onSelect,
  shrinkToContent,
}: BuildInterviewTypeOptionProps) {
  const descriptionId = `${id}-description`;

  const widthClass = shrinkToContent
    ? "inline-flex justify-self-start"
    : "flex w-full";

  return (
    <label
      htmlFor={id}
      className={`${widthClass} flex-col gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/40"}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        checked={selected}
        onChange={onSelect}
        aria-describedby={descriptionId}
        className="sr-only"
      />
      <span className="font-medium">{label}</span>
      {description ? (
        <span id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </span>
      ) : null}
    </label>
  );
}
