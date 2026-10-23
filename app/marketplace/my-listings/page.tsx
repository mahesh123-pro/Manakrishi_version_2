import { MyListings } from "@/components/marketplace/Manage";
export const metadata = {
  title: "My crop listings",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <MyListings />;
}
