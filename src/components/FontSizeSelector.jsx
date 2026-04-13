import { useEffect, useMemo, useState } from "react";
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputBase,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import { clamp } from "../utils/number";

const DEFAULT_PRESETS = [8, 9, 10, 11, 12, 14, 18, 20, 24, 30, 36, 48, 60, 72, 96];

export default function FontSizeSelector({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  fullWidth = false,
}) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const presetValues = useMemo(() => {
    const withCurrent = new Set([...DEFAULT_PRESETS, value]);
    return Array.from(withCurrent)
      .filter((size) => size >= min && size <= max)
      .sort((a, b) => a - b);
  }, [max, min, value]);

  const commitValue = (nextValue) => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) {
      setDraftValue(String(value));
      return;
    }

    const clampedValue = clamp(parsed, min, max);
    onChange(clampedValue);
    setDraftValue(String(clampedValue));
  };

  const nudgeValue = (direction) => {
    commitValue(value + direction * step);
  };

  return (
    <Stack spacing={1.5} sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Typography component="label" htmlFor={id} variant="subtitle2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>

      <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
        <Box sx={{ position: "relative" }}>
          <Paper
            variant="outlined"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              width: fullWidth ? "100%" : "fit-content",
              minWidth: 188,
              overflow: "hidden",
              borderRadius: 2.5,
              borderColor: menuOpen ? theme.palette.primary.main : "divider",
              boxShadow: menuOpen ? `0 0 0 3px ${theme.palette.primary.main}22` : "none",
            })}
          >
            <IconButton
              aria-label="Schriftgröße verkleinern"
              onClick={() => nudgeValue(-1)}
              size="small"
              sx={{ borderRadius: 0, px: 1.25, py: 1.1 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 76,
                px: 1.25,
                borderLeft: "1px solid",
                borderRight: "1px solid",
                borderColor: "divider",
              }}
            >
              <InputBase
                id={id}
                value={draftValue}
                onChange={(event) =>
                  setDraftValue(event.target.value.replace(/[^\d]/g, "").slice(0, 3))
                }
                onBlur={() => commitValue(draftValue)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitValue(draftValue);
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    nudgeValue(1);
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    nudgeValue(-1);
                  }
                }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  "aria-label": label,
                }}
                sx={{
                  width: 36,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                px
              </Typography>
            </Box>

            <IconButton
              aria-label="Schriftgrößen auswählen"
              onClick={() => setMenuOpen((open) => !open)}
              size="small"
              sx={{ borderRadius: 0, px: 1, py: 1.1 }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>

            <IconButton
              aria-label="Schriftgröße vergrößern"
              onClick={() => nudgeValue(1)}
              size="small"
              sx={{ borderRadius: 0, px: 1.25, py: 1.1 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Paper>

          {menuOpen && (
            <Paper
              elevation={8}
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 10,
                width: 96,
                maxHeight: 240,
                borderRadius: 2,
              }}
            >
              <MenuList dense sx={{ maxHeight: 240, overflowY: "auto", py: 0.5 }}>
                {presetValues.map((preset) => (
                  <MenuItem
                    key={preset}
                    selected={preset === value}
                    onClick={() => {
                      commitValue(preset);
                      setMenuOpen(false);
                    }}
                    dense
                  >
                    {preset}
                  </MenuItem>
                ))}
              </MenuList>
            </Paper>
          )}
        </Box>
      </ClickAwayListener>
    </Stack>
  );
}
