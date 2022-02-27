import Nav from "./Nav";
import styles from "../styles/Home.module.css";

export default function Layout({ children }: any) {
  return (
    <div className={styles.container}>
      <Nav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
