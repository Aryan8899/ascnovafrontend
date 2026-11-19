import StatusClient from "./StatusClient";

export function generateStaticParams() {
  return [{ token: "placeholder" }];
}

export default function Page() {
  return <StatusClient />;
}