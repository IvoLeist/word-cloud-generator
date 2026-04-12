import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

function SummaryCard({ label, value }) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.82)"
            : "rgba(17,24,39,0.82)",
        backdropFilter: "blur(12px)",
      })}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function HeaderSummary({
  wordCount,
  canvasWidth,
  canvasHeight,
  colorMode,
  onToggleColorMode,
}) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2.5}
      alignItems={{ xs: "stretch", lg: "flex-end" }}
      justifyContent="space-between"
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: 800 }}
          >
            German Word Cloud Generator
          </Typography>
          <Button
            variant="outlined"
            startIcon={colorMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            onClick={onToggleColorMode}
          >
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ minWidth: { lg: 360 } }}>
        <SummaryCard label="Wörter oder Sätze" value={wordCount} />
        <SummaryCard label="Format" value={`${canvasWidth} x ${canvasHeight}`} />
      </Stack>
    </Stack>
  );
}
