import type { Metadata } from "next";
import { Discover } from "@/components/marketplace/Discover";
export const metadata: Metadata = {
  title: "Crops & Farm Inputs | Manakrishi Marketplace",
  description:
    "Discover crops from local farmers and request quotes for mulch sheets, seeds, saplings, plant protection and drip supplies.",
  alternates: { canonical: "/marketplace" },
};
export default function Page() {
  return <Discover />;
}
