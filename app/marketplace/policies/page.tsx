"use client";
import { useEffect, useState } from "react";
import {
  PageHeading,
  useMarket,
} from "@/components/marketplace/MarketProvider";
export default function Policies() {
  const { c, api } = useMarket();
  const [rules, setRules] = useState("");
  useEffect(() => {
    api<{ rules: string }>("rules")
      .then((r) => setRules(r.rules))
      .catch(() => {});
  }, [api]);
  return (
    <div className="mk-container max-w-3xl">
      <PageHeading
        title={c(
          "A fairer market starts with clear expectations",
          "స్పష్టమైన అంచనాలతో న్యాయమైన మార్కెట్",
        )}
        body={c(
          "Read these before buying or listing produce.",
          "కొనుగోలు లేదా అమ్మకానికి ముందు చదవండి.",
        )}
      />
      <div className="mk-panel space-y-7">
        {[
          [
            "Purchase requests, not prepaid orders",
            "కొనుగోలు అభ్యర్థనలు, ముందస్తు చెల్లింపులు కావు",
            "Checkout reserves the listed quantity for 24 hours and sends a request to each farmer. The seller must confirm it. Unconfirmed requests expire automatically when marketplace data is next accessed, and stock is released.",
            "చెకౌట్ పరిమాణాన్ని 24 గంటలు రిజర్వ్ చేసి రైతుకు అభ్యర్థన పంపుతుంది. రైతు నిర్ధారించాలి. నిర్ధారించని అభ్యర్థనలు మార్కెట్ డేటాను మళ్లీ యాక్సెస్ చేసినప్పుడు గడువు ముగిసి స్టాక్ విడుదలవుతుంది.",
          ],
          [
            "Transparent pricing and fulfillment",
            "పారదర్శక ధర, డెలివరీ",
            "Displayed amounts cover produce only. Confirm grading, weights, packing, taxes, transport charges, collection location and timing directly with the farmer before agreeing to pay. No marketplace delivery fleet or online payment collection is connected.",
            "చూపిన ధర పంటకు మాత్రమే. నాణ్యత, బరువు, ప్యాకింగ్, పన్నులు, రవాణా ఛార్జీలు, సేకరణ ప్రాంతం, సమయాన్ని రైతుతో నిర్ధారించి చెల్లించండి. మార్కెట్ డెలివరీ వాహనాలు లేదా ఆన్‌లైన్ చెల్లింపులు అనుసంధానం కాలేదు.",
          ],
          [
            "Photographs and verification",
            "చిత్రాలు, ధృవీకరణ",
            "Farmers must upload photographs of their actual produce. Homepage imagery is illustrative. A seller badge appears only after an administrator records verification evidence. It is not a guarantee of crop quality. Organic claims are seller declarations and need review.",
            "రైతులు తమ అసలు పంట చిత్రాలు అప్‌లోడ్ చేయాలి. హోమ్‌పేజీ చిత్రాలు సూచన కోసం. అడ్మిన్ ఆధారాలతో ధృవీకరించిన తర్వాతే విక్రేత బ్యాడ్జ్ కనిపిస్తుంది. ఇది పంట నాణ్యతకు హామీ కాదు. సేంద్రియ ప్రకటనలకు సమీక్ష అవసరం.",
          ],
          [
            "Protect your information",
            "మీ సమాచారాన్ని రక్షించుకోండి",
            "Public listings show general location. Private contact, exact collection location and GPS coordinates are not public. Order contact details are available only to that buyer, that seller and administrators. Never share passwords, OTPs or bank credentials in enquiries.",
            "పబ్లిక్ లిస్టింగ్‌లలో సాధారణ ప్రాంతం మాత్రమే. ప్రైవేట్ ఫోన్, సేకరణ ప్రాంతం, GPS పబ్లిక్ కాదు. ఆర్డర్ వివరాలు ఆ కొనుగోలుదారు, ఆ విక్రేత, అడ్మిన్లకు మాత్రమే. విచారణల్లో పాస్‌వర్డ్, OTP, బ్యాంకు వివరాలు పంచవద్దు.",
          ],
          [
            "Questions, cancellations and disputes",
            "ప్రశ్నలు, రద్దులు, వివాదాలు",
            "Buyers can cancel an unconfirmed request. Sellers can accept or reject with a reason. For issues after confirmation, contact Manakrishi support with the order ID. Refunds are not processed by this marketplace because it does not collect marketplace payments.",
            "కొనుగోలుదారులు నిర్ధారించని అభ్యర్థనను రద్దు చేయవచ్చు. విక్రేతలు కారణంతో ఆమోదించవచ్చు లేదా తిరస్కరించవచ్చు. నిర్ధారణ తర్వాత సమస్యలకు ఆర్డర్ IDతో మనకృషి సహాయాన్ని సంప్రదించండి. మార్కెట్ చెల్లింపులు సేకరించదు కాబట్టి రీఫండ్‌లు ఇక్కడ ప్రాసెస్ కావు.",
          ],
        ].map(([title, te, body, bte]) => (
          <section key={title}>
            <h2 className="font-heading text-xl font-semibold">
              {c(title, te)}
            </h2>
            <p className="mt-3 text-sm leading-8 text-muted">{c(body, bte)}</p>
          </section>
        ))}
        {rules && (
          <section>
            <h2 className="font-heading text-xl">
              {c("Additional marketplace rules", "అదనపు మార్కెట్ నిబంధనలు")}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-8">
              {rules}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
