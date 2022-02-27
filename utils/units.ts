
const UNITS = [
  "tbs",
  "tbsp",
  "tsp",
  "cup",
  "cups",
  "oz",
  "lb",
  "item",
  "can",
  "bottle",
  "pint",
  "package",
  "box",
  "can",
  "non-quantity",
] as const;
type Unit = typeof UNITS[number];

export default UNITS;