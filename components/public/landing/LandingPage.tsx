"use client";

import { useState } from "react";
import Header from "@/components/public/landing/Header";
import Hero from "@/components/public/landing/Hero";
import Tours from "@/components/public/landing/Tours";
import About from "@/components/public/landing/About";
import Gallery from "@/components/public/landing/Gallery";
import Team from "@/components/public/landing/Team";
import FAQ from "@/components/public/landing/FAQ";
import Documents from "@/components/public/landing/Documents";
import ApplicationForm from "@/components/public/landing/ApplicationForm";
import PaymentMethods from "@/components/public/landing/PaymentMethods";
import Footer from "@/components/public/landing/Footer";

export type LandingLang = "kz" | "ru" | "en";

export default function LandingPage() {
  const [currentLang, setCurrentLang] = useState<LandingLang>("ru");

  return (
    <div className="min-h-screen bg-white">
      <Header currentLang={currentLang} onLangChange={setCurrentLang} />
      <Hero lang={currentLang} />
      <Tours lang={currentLang} />
      <About lang={currentLang} />
      <Gallery lang={currentLang} />
      <Team lang={currentLang} />
      <FAQ lang={currentLang} />
      <Documents lang={currentLang} />
      <ApplicationForm lang={currentLang} />
      <PaymentMethods lang={currentLang} />
      <Footer lang={currentLang} />
    </div>
  );
}
