import CTA from "@/components/Landing/CTA";
import FAQ from "@/components/Landing/FAQ";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import Navbar from "@/components/Landing/Navbar";
import Preview from "@/components/Landing/Preview";
import Steps from "@/components/Landing/Steps";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/main/tests`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar/>
      <Hero/>
      <Steps/>
      <Preview/>
      <FAQ/>
      <CTA/>
      <Footer/>
    </div>
  );
}
