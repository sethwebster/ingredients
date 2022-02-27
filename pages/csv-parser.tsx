import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { processRecipeLine } from "../utils/ingredientsParsing";
import syntaxHighlight from "../utils/syntaxHighlight";
import Clipboard from "react-clipboard.js";
import { useTimedState } from "../hooks/useTimeout";

const handleLoadEvent = (
  setFileContents: (str: string) => void,
  contents: string
) => setFileContents(contents);

function loadCSV(str: string) {
  const result = Papa.parse(str, {
    header: true,
    transform: (value, field) => value.trim(),
    dynamicTyping: true,
    transformHeader: (header) =>
      header
        .toLowerCase()
        .replace(":", "")
        .trim()
        .replace(" ", "_")
        .replace("description", "introContent")
        .replace("default", "defaultForRecipeCategory")
        .replace("prep_time", "prepTime")
        .replace("total_time", "totalTime"),
  });
  return result;
}

function processPrepTime(prepString: string) {
  const parts = prepString.split(" ");
  const unit = parts[1].toLowerCase().replace("+", "");
  if (unit === "minutes") return Number(parts[0]);
  if (unit === "hours" || unit === "hour") return Number(parts[0]) * 60;
  throw new Error("Duration " + parts[1] + " not recognized");
}

function processItem(data: any) {
  return {
    ...data,
    cuisines: [],
    animalsSaved: [],
    day: data.day - 1,
    defaultForRecipeCategory: !data.defaultForRecipeCategory
      ? "Healthy"
      : data.defaultForRecipeCategory,
    introContent: !data.introContent ? "" : data.introContent,
    ingredients: data.ingredients.split("\n").map(processRecipeLine),
    prepTime: processPrepTime(data.prepTime),
    totalTime: processPrepTime(data.totalTime),
    instructions: data.instructions
      .replace(/(\d\.)/g, "\n")
      .split("\n")
      .map((s: string) => s.trim())
      .filter((n: string) => n.length > 0)
      .map((s: string) => ({ text: s })),
  };
}

function processFileData(str: string) {
  const csvData = loadCSV(str);
  const parsedData = csvData.data.map(processItem).map((item) => {
    delete item.badge;
    delete item.video;
    return item;
  });
  console.log(parsedData);
  return parsedData;
}

const CSVParser: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileContents, setFileContents] = useState("");
  const [result, setResult] = useState("");
  const [copiedVisible, setCopiedVisible] = useTimedState(false, 1500);

  useEffect(() => {
    if (!file) {
      return;
    }
    const reader = new FileReader();

    const wrapper = (event: ProgressEvent<FileReader>) => {
      handleLoadEvent(setFileContents, event.target?.result as string);
    };

    reader.addEventListener("load", wrapper);
    reader.readAsText(file);
    return () => reader.removeEventListener("load", wrapper);
  }, [file]);

  useEffect(() => {
    if (fileContents.length === 0) return;
    const data = processFileData(fileContents);
    setResult(JSON.stringify(data, undefined, 4));
  }, [fileContents]);

  return (
    <>
      <Head>
        <title>VegWeek App Ingredient Parser</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Input</h1>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          if (!e.target.files) return;
          setFile(e.target.files[0]);
        }}
      ></input>
      <Clipboard
        data-clipboard-text={result}
        onSuccess={() => setCopiedVisible(true)}
      >
        {copiedVisible && "Copied"}
        {!copiedVisible && "copy to clipboard"}
      </Clipboard>
      <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(result) }} />
    </>
  );
};

export default CSVParser;
