"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeGallery } from "@/components/gallery/ThemeGallery";
import { FeaturedCarousel } from "@/components/gallery/FeaturedCarousel";
import { useAllThemes } from "@/lib/themes/client";

export default function ExplorePage() {
  const [showEmojis, setShowEmojis] = useState(false);
  const { themes, loading } = useAllThemes();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden md:pl-64">
      <Navbar />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            Find your experience
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium max-w-2xl">
            Every theme is a little mini-app with its own mechanic. Filter to{" "}
            <span className="text-primary font-bold">✦ Experiences</span> for the interactive ones, or browse all styles.
          </p>
        </header>

        <FeaturedCarousel themes={themes} showEmojis={showEmojis} />

        <section className="flex-1">
          <ThemeGallery themes={themes} loading={loading} showEmojis={showEmojis} onToggleEmojis={setShowEmojis} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
