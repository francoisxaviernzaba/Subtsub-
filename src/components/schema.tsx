"use client";

import { useEffect } from "react";

type FAQ = { question: string; answer: string };

export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [faqs]);

  return null;
}

export function OrganizationSchema() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SUB2SUB",
      description: "YouTube growth platform - Watch, Subscribe, Earn, Boost",
      url: process.env.NEXTAUTH_URL || "https://subtsub.vercel.app",
      logo: `${process.env.NEXTAUTH_URL || "https://subtsub.vercel.app"}/icon.svg`,
      sameAs: [],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);
  return null;
}

export function WebApplicationSchema() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "SUB2SUB",
      description: "Earn coins by watching videos and subscribing to YouTube channels. Boost your YouTube growth.",
      url: process.env.NEXTAUTH_URL || "https://subtsub.vercel.app",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to use",
      },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);
  return null;
}
