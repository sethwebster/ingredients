import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "flex-start",
        backgroundColor: "darkblue",
      }}
    >
      <div style={{ padding: 4, color: "lightgrey" }}>
        <Link href={"/csv-parser"}>CSV Parser</Link>
      </div>
      <div style={{ padding: 4, color: "lightgrey" }}>
        <Link href={"/ingredients-parser"}>Ingredients Parser</Link>
      </div>
    </nav>
  );
}
