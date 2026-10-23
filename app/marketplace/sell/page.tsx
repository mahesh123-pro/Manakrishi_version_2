import { Suspense } from "react";
import { Sell } from "@/components/marketplace/Sell";
export const metadata = {
  title: "Sell your harvest",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense>
      <Sell />
    </Suspense>
  );
}
