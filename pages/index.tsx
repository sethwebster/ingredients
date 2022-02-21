import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import Clipboard from "react-clipboard.js";
import syntaxHighlight from "../utils/syntaxHighlight";

const Fraction = require("fraction.js");

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

const regExpMatchStr = "\\d*\\s\\d*(" + UNITS.join("|") + ")\\s";
const regExpMatch = new RegExp(regExpMatchStr);
console.log(regExpMatch);
function fixupSymbols(str: string) {
  return str
    .replace(/¼/g, "1/4")
    .replace(/½/g, "1/2")
    .replace(/¾/g, "3/4")
    .replace(/⅔/g, "2/3")
    .replace(/⅓/g, "1/3")
    .replace(/1½/g, "1 1/2")
    .replace(/11\/2/g, "1 1/2")
    .replace(/11\/3/g, "1 1/3")
    .replace(/11\/4/g, "1 1/4")
    .replace(/tablespoons/g, "tbsp")
    .replace(/teaspoons/g, "tsp")
    .replace(/; /g, "\n");
}

function tryParseFraction(val: string) {
  try {
    return new Fraction(val).valueOf();
  } catch (ex) {
    return -1;
  }
}

function numberOfNumbericParts(parts: string[]) {
  const clone = [...parts];
  while (startsWithNumber(clone[0])) {
    clone.splice(0, 1);
  }
  return parts.length - clone.length;
}

function startsWithNumber(str: string): boolean {
  if (str.length === 0) return false;
  return Number.parseInt(str.charAt(0)) >= 0;
}

function isUnitBased(line: string): boolean {
  const parts = line.split(" ");
  const numericPartsCount = numberOfNumbericParts(parts);
  if (startsWithNumber(line) && UNITS.includes(parts[numericPartsCount] as any))
    return true;
  return false;
}

function parseQuantityBasedLine(parts: string[]) {
  let quantity = 0;
  if (parts[0].includes("/")) {
    quantity = tryParseFraction(parts.splice(0, 1)[0]);
  } else {
    quantity = Number.parseInt(parts.splice(0, 1)[0]);
  }
  const name = parts.join(" ");
  return { name, quantity };
}

function parseUnitBasedLine(parts: string[], numericPartsCount: number) {
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
    return { name, quantity: quantities, unit };
  } else {
    if (parts.join(" ").match(regExpMatch)) {
      // Is an item like 1 8 oz container brown mushrooms sliced
      return { ...parseQuantityBasedLine(parts), unit: "item" };
    } else {
      const quantity = tryParseFraction(numericParts.join(" "));
      const unit = clone.splice(0, 1)[0];
      const name = clone.join(" ");
      return { name, quantity, unit };
    }
  }
}

function processRecipeLine(line: string) {
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
    };
  } else {
    if (startsWithNumber(line)) {
      var { name, quantity } = parseQuantityBasedLine(parts);
      return {
        name,
        unit: "item",
        quantity,
      };
    } else {
      return {
        name: line,
        unit: "non-quantity",
        quantity: -1,
      };
    }
  }
}

function processRawRecipePaste(text: string) {
  const lines = text.split("\n").map(fixupSymbols);
  return JSON.stringify(lines.map(processRecipeLine), undefined, 4);
}

const Home: NextPage = () => {
  const [val, setVal] = useState("");
  const [output, setOutput] = useState("");
  console.log(fixupSymbols("1 8 oz container brown mushrooms sliced"));
  console.log(
    processRecipeLine(fixupSymbols("1 8 oz container brown mushrooms sliced"))
  );
  console.log("1 8 oz container brown mushrooms sliced".match(regExpMatch));
  console.assert(
    processRecipeLine(fixupSymbols("1 8 oz container brown mushrooms sliced"))
      .quantity == 1,
    "didn't work"
  );
  const handleChange = (text: string) => {
    const quoteErrorRegExp = /^\"|"$/g
    let fixed = text.replace(/\;\s/g, "\n").replace(quoteErrorRegExp, "");
    if (fixed.startsWith("\"")) {
      fixed = fixed
    }
    setVal(fixed);
    setOutput(processRawRecipePaste(fixed));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>VegWeek App Ingredient Parser</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Input</h1>
        <textarea
          style={{ width: "100%", height: 200 }}
          value={val}
          onChange={(e) => handleChange(e.currentTarget.value)}
        />
        <h1>Output</h1>
        <Clipboard data-clipboard-text={output}>copy to clipboard</Clipboard>
        <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(output) }} />
      </main>
    </div>
  );
};

export default Home;
