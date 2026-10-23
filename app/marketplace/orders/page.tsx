import { Orders } from "@/components/marketplace/Manage";
export const metadata = {
  title: "Marketplace orders",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Orders />;
}
