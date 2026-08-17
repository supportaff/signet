import { BestPractices } from "@/components/landing/best-practices";
import { CertGuide } from "@/components/landing/cert-guide";
import { Comparison } from "@/components/landing/comparison";
import { Faq, faqs } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { FreeTools } from "@/components/landing/free-tools";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { SslCheckSection } from "@/components/landing/ssl-check-section";
import { WorksWith } from "@/components/landing/works-with";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, softwareApplicationJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export default function Home() {
  const jsonLd = [
    softwareApplicationJsonLd(),
    organizationJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: site.canonical,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <SslCheckSection />
      <WorksWith />
      <Features />
      <HowItWorks />
      <FreeTools />
      <CertGuide />
      <BestPractices />
      <Comparison />
      <PricingPreview />
      <Faq />
      <FinalCta />
    </>
  );
}
