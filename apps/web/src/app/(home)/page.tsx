export const dynamic = "force-static";

import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import CustomStackPanel from "./_components/custom-stack-panel";
import DeploymentSection from "./_components/deployment-section";
import Footer from "./_components/footer";
import HeroSection from "./_components/hero-section";
import LogoMarquee from "./_components/logo-marquee";
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
      <LogoMarquee />
      <CustomStackPanel />
      <DeploymentSection />
      <Testimonials tweets={tweets} videos={videos} />
      <Footer />
    </main>
  );
}
