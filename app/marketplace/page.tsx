import type { Metadata } from "next";
import { Discover } from "@/components/marketplace/Discover";
export const metadata: Metadata = {
  title: "Marketplace | From Farmers to Families",
  description:
    "Discover agricultural produce directly from farmers. Compare crops, prices and harvests with Manakrishi.",
  alternates: { canonical: "/marketplace" },
};
export default function Page() {
  return <Discover />;
}
