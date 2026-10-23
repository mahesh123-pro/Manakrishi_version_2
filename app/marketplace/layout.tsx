import { MarketProvider } from "@/components/marketplace/MarketProvider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <MarketProvider>{children}</MarketProvider>;
}
