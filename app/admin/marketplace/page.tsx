import { MarketProvider } from "@/components/marketplace/MarketProvider";
import { Admin } from "@/components/marketplace/Manage";
export const metadata = {
  title: "Marketplace administration",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <MarketProvider>
      <Admin />
    </MarketProvider>
  );
}
