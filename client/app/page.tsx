"use client";

import Comparision from "@/components/Home/Comparision";
import CTA from "@/components/Home/CTA";
import Footer from "@/components/Home/Footer";
import Hero from "@/components/Home/Hero";
import Navbar from "@/components/Home/Navbar";
import Preview from "@/components/Home/Preview";
import Steps from "@/components/Home/Steps";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      <Navbar/>
      <Hero/>
      <Steps/>
      <Preview/>
      <Comparision/>
      <CTA/>
      <Footer/>
    </div>
  );
}
