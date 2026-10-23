import { Storefront } from "@/components/marketplace/Discover";
export const metadata = {
  title: "Farmer storefront",
  robots: { index: false, follow: true },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Storefront id={(await params).id} />;
}
