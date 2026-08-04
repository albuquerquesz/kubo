import { z } from "zod";

export const kuboLaunchSchema = z.object({
  headline: z.string(),
  problemBullets: z.array(z.string()).min(1).max(5),
  command: z.string(),
  ctaUrl: z.string(),
  musicFile: z.string().nullable(),
  musicVolume: z.number().min(0).max(1),
});

export type KuboLaunchProps = z.infer<typeof kuboLaunchSchema>;

export const defaultKuboLaunchProps: KuboLaunchProps = {
  headline: "Full-stack em um comando",
  problemBullets: ["Setup engole o dia", "Stack fragmentada", "Deploy longe do código"],
  command: "bun create kubojs",
  ctaUrl: "kubojs.dev",
  /** Set to `audio/launch-bed.mp3` after dropping a file in public/audio/. */
  musicFile: null,
  musicVolume: 0.45,
};
