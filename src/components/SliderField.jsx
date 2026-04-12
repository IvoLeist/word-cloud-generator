import { clamp } from "../utils/number";

export default function SliderField({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  suffix = "",
  onChange,
}) {
  const handleChange = (nextValue) => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed, min, max));
  };

  return (
    <div className="slider-field">
      <label htmlFor={id}>
        {label}: {value}
        {suffix}
      </label>
      <div className="slider-input-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
        />
        <input
          aria-label={`${label} direkt eingeben`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
        />
      </div>
    </div>
  );
}
