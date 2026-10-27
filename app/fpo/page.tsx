import { MarketProvider } from "@/components/marketplace/MarketProvider";
import { Fpo } from "@/components/marketplace/Fpo";

export const metadata = {
  title: "FPO member desk",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <MarketProvider>
      <Fpo />
    </MarketProvider>
  );
}
