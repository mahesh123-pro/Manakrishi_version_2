import type { Metadata } from "next";
import { Product } from "@/components/marketplace/Buy";
import { getListing } from "@/lib/marketplace/service";
import { SITE } from "@/lib/content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const l = getListing(id);
    return {
      title: `${l.crop} ${l.variety} | ${l.district}`,
      description: `${l.crop} from ${l.seller} in ${l.district}, ${l.state}. ${l.quantity} ${l.unit} available.`,
      alternates: { canonical: `/marketplace/product/${id}` },
      robots: { index: l.quantity >= l.minimum, follow: true },
    };
  } catch {
    return { title: "Crop listing", robots: { index: false, follow: false } };
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let structured = null;
  try {
    const l = getListing(id);
    structured = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: l.crop,
      description: l.description,
      image: l.images.map((src) => `${SITE.url}${src}`),
      offers: {
        "@type": "Offer",
        price: l.price,
        priceCurrency: "INR",
        availability:
          l.quantity >= l.minimum
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `${SITE.url}/marketplace/product/${id}`,
        seller: { "@type": "Organization", name: l.seller },
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: l.price,
          priceCurrency: "INR",
          unitText: l.unit,
        },
      },
    };
  } catch {}
  return (
    <>
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Product id={id} />
    </>
  );
}
