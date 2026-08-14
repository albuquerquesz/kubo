export const dynamic = "force-static";

import { api } from "@better-t-stack/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { emptySponsorsData } from "@/lib/sponsors";

import CapabilitySection from "./_components/capability-section";
import CommandSection from "./_components/command-section";
import Footer from "./_components/footer";
import HeroSection from "./_components/hero-section";
import ProductMosaicSection from "./_components/product-mosaic-section";
import SponsorsSection from "./_components/sponsors-section";
import StatsSection from "./_components/stats-section";
import Testimonials from "./_components/testimonials";

export default async function HomePage() {
  const [tweetsResult, videosResult] = await Promise.allSettled([
    fetchQuery(api.testimonials.getTweets),
    fetchQuery(api.testimonials.getVideos),
  ]);
  const fetchedTweets = tweetsResult.status === "fulfilled" ? tweetsResult.value : [];
  const fetchedVideos = videosResult.status === "fulfilled" ? videosResult.value : [];
  const videos = fetchedVideos.map((v) => ({
    embedId: v.embedId,
    title: v.title,
  }));
  const tweets = fetchedTweets.map((t) => ({ tweetId: t.tweetId }));

  return (
    <main className="ui-frame min-h-svh">
      <HeroSection />
      <SponsorsSection sponsorsData={emptySponsorsData} />
      <CommandSection />
      <ProductMosaicSection />
      <CapabilitySection />
      <StatsSection />
      <Testimonials tweets={tweets} videos={videos} />
      <Footer />
    </main>
  );
}
