import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import Clipboard from "react-clipboard.js";
import syntaxHighlight from "../utils/syntaxHighlight";

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

const Fraction = require("fraction.js");

function fixupSymbols(str: string) {
  return str
    .replaceAll("¼", "1/4")
    .replaceAll("½", "1/2")
    .replaceAll("¾", "3/4")
    .replaceAll("⅔", "2/3")
    .replaceAll("⅓", "1/3")
    .replaceAll("1½", "1 1/2")
    .replaceAll("11/2", "1 1/2")
    .replaceAll("11/3", "1 1/3")
    .replaceAll("11/4", "1 1/4")
    .replaceAll("tablespoons", "tbsp")
    .replaceAll("teaspoons", "tsp")
    .replaceAll("; ", "\n");
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
  const quantity = tryParseFraction(
    parts.splice(0, numericPartsCount).join(" ")
  );
  const unit = parts.splice(0, 1)[0];
  const name = parts.join(" ");
  return { name, quantity, unit };
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

  const handleChange = (text: string) => {
    const fixed = text.replaceAll("; ", "\n");
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
