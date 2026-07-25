import Input from "@/components/ui/Input";

export default function Field({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
        {label}
      </span>
      <Input {...inputProps} />
    </label>
  );
}
