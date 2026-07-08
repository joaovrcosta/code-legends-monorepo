"use client";

import {
  ALL_PLAN_FEATURES,
  PLAN_FEATURE_LABELS,
  type PlanFeature,
} from "@code-legends/plans";

type PlanFeatureCheckboxesProps = {
  value: PlanFeature[];
  onChange: (features: PlanFeature[]) => void;
};

export function PlanFeatureCheckboxes({
  value,
  onChange,
}: PlanFeatureCheckboxesProps) {
  const selected = new Set(value);

  const toggle = (feature: PlanFeature) => {
    if (selected.has(feature)) {
      onChange(value.filter((item) => item !== feature));
      return;
    }
    onChange([...value, feature]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ch">Funcionalidades do plano</p>
      <div className="grid gap-3 md:grid-cols-2">
        {ALL_PLAN_FEATURES.map((feature) => (
          <label
            key={feature}
            className="flex items-start gap-2 rounded-md border border-ch-border p-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(feature)}
              onChange={() => toggle(feature)}
              className="mt-0.5 rounded border-ch-border"
            />
            <span>
              <span className="block text-sm font-medium text-ch">
                {PLAN_FEATURE_LABELS[feature]}
              </span>
              <span className="block text-xs text-ch-muted font-mono">
                {feature}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
