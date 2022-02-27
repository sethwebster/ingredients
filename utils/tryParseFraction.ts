const Fraction = require("fraction.js");

export default function tryParseFraction(val: string) {
  try {
    return new Fraction(val).valueOf();
  } catch (ex) {
    return -1;
  }
}
