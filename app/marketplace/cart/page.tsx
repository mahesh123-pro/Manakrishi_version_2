import { Cart } from "@/components/marketplace/Buy";
export const metadata = {
  title: "Your harvest basket",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Cart />;
}
