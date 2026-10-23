import { Cart } from "@/components/marketplace/Buy";
export const metadata = {
  title: "Marketplace checkout",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Cart checkout />;
}
