import { Check } from 'lucide-react';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
}

const LABELS = [
  { num: 1, label: 'Muy en desacuerdo', short: '1' },
  { num: 2, label: 'En desacuerdo', short: '2' },
  { num: 3, label: 'Neutral', short: '3' },
  { num: 4, label: 'De acuerdo', short: '4' },
  { num: 5, label: 'Muy de acuerdo', short: '5' },
];

export default function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {LABELS.map((opt) => {
        const selected = value === opt.num;
        return (
          <button
            key={opt.num}
            type="button"
            onClick={() => onChange(opt.num)}
            className={`group flex flex-1 flex-col items-center gap-1 rounded-xl border p-2.5 transition-all sm:px-2 ${
              selected
                ? 'border-gold bg-gold-50 shadow-sm'
                : 'border-neutral-border bg-white hover:border-gold-light hover:bg-cream-50'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                selected
                  ? 'border-gold bg-gold text-white'
                  : 'border-neutral-border text-neutral-elegant group-hover:border-gold-light'
              }`}
            >
              {selected ? <Check className="h-4 w-4" /> : opt.short}
            </div>
            <span
              className={`text-[0.65rem] leading-tight text-center sm:text-xs ${
                selected ? 'text-charcoal-900 font-medium' : 'text-neutral-elegant'
              }`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
