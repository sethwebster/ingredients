import numberOfNumbericParts from "./numberOfNumbericParts";
import startsWithNumber from "./startsWithNumber";
import tryParseFraction from "./tryParseFraction";
import UNITS from "./units";


const regExpMatchStr = "\\d*\\s\\d*(" + UNITS.join("|") + ")\\s";
const regExpMatch = new RegExp(regExpMatchStr);


export function isUnitBased(line: string): boolean {
  const parts = line.split(" ");
  const numericPartsCount = numberOfNumbericParts(parts);
  if (startsWithNumber(line) && UNITS.includes(parts[numericPartsCount] as any))
    return true;
  return false;
}

export function parseQuantityBasedLine(parts: string[]) {
  let quantity = 0;
  if (parts[0].includes("/")) {
    quantity = tryParseFraction(parts.splice(0, 1)[0]);
  } else {
    quantity = Number.parseInt(parts.splice(0, 1)[0]);
  }
  const name = parts.join(" ");
  return { name, quantity, checked: false };
}

export function parseUnitBasedLine(parts: string[], numericPartsCount: number) {
  const clone = [...parts];
  let numericParts = clone.splice(0, numericPartsCount);
  if (numericParts.join(" ").includes("-")) {
    // RANGE
    const quantities = numericParts
      .join(" ")
      .replace("-", " ")
      .split(" ")
      .map((part) => tryParseFraction(part));
    const unit = clone.splice(0, 1)[0];
    const name = clone.join(" ");
    return { name, quantity: quantities, unit, checked: false };
  } else {
    if (parts.join(" ").match(regExpMatch)) {
      // Is an item like 1 8 oz container brown mushrooms sliced
      return { ...parseQuantityBasedLine(parts), unit: "item" };
    } else {
      const quantity = tryParseFraction(numericParts.join(" "));
      const unit = clone.splice(0, 1)[0];
      const name = clone.join(" ");
      return { name, quantity, unit, checked: false };
    }
  }
}

export function processRecipeLine(line: string) {
  const parts = line.split(" ");
  const numericPartsCount = numberOfNumbericParts(parts);
  if (isUnitBased(line)) {
    const { name, quantity, unit } = parseUnitBasedLine(
      parts,
      numericPartsCount
    );

    return {
      name,
      quantity,
      unit,
      checked: false,
    };
  } else {
    if (startsWithNumber(line)) {
      var { name, quantity } = parseQuantityBasedLine(parts);
      return {
        name,
        unit: "item",
        quantity,
        checked: false,
      };
    } else {
      return {
        name: line,
        unit: "non-quantity",
        quantity: -1,
        checked: false,
      };
    }
  }
}