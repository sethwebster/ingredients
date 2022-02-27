import startsWithNumber from "./startsWithNumber";

export default function numberOfNumbericParts(parts: string[]) {
  const clone = [...parts];
  while (startsWithNumber(clone[0])) {
    clone.splice(0, 1);
  }
  return parts.length - clone.length;
}
