"use client";

import CTA from "@/components/Landing/CTA";
import FAQ from "@/components/Landing/FAQ";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import Navbar from "@/components/Landing/Navbar";
import Preview from "@/components/Landing/Preview";
import Steps from "@/components/Landing/Steps";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
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
