export const dynamic = "force-static";

import { api } from "@kubo/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import CapabilitySection from "./_components/capability-section";
import CommandSection from "./_components/command-section";
import Footer from "./_components/footer";
import HeroSection from "./_components/hero-section";
import SponsorsSection from "./_components/sponsors-section";
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
      <SponsorsSection />
      <CommandSection />
      <CapabilitySection />
      <Testimonials tweets={tweets} videos={videos} />
      <Footer />
    </main>
  );
}
