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
      <CustomStackPanel className="mb-0 sm:mb-0 lg:mb-0" showViewportBottomRule={false} />
      <CustomStackPanel
        sectionId="product-secondary"
        titleId="custom-stack-title-secondary"
        className="mt-0 border-t sm:mt-0 lg:mt-0"
        showSideBorders
        showViewportTopRule={false}
        showViewportBottomRule={false}
      />
      <DeploymentSection />
      <Testimonials tweets={tweets} videos={videos} />
      <Footer />
    </main>
  );
}
