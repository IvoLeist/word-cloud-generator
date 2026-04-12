import { Slider, Stack, TextField, Typography } from "@mui/material";
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
    <Stack spacing={1.5}>
      <Typography component="label" htmlFor={id} variant="subtitle2" sx={{ fontWeight: 700 }}>
        {label}: {value}
        {suffix}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(_, nextValue) => handleChange(nextValue)}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          type="number"
          inputProps={{ min, max, step }}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          sx={{ width: { xs: "100%", sm: 96 } }}
        />
      </Stack>
    </Stack>
  );
}
