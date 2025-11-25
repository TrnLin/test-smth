import type { Route } from "./+types/home";
import { Portfolio } from "../components/Portfolio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alexandra Chen — Designer & Creative Director" },
    { name: "description", content: "Portfolio of Alexandra Chen, a multidisciplinary designer crafting bold visual experiences." },
  ];
}

export default function Home() {
  return <Portfolio />;
}
