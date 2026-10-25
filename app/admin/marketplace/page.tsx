import { MarketProvider } from "@/components/marketplace/MarketProvider";
import { Admin } from "@/components/marketplace/Admin";
export const metadata = {
  title: "Admin workspace",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <MarketProvider>
      <Admin />
    </MarketProvider>
  );
}
