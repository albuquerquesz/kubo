import { z } from "zod";

export const kuboLaunchSchema = z.object({
  command: z.string(),
  musicFile: z.string().nullable(),
  musicVolume: z.number().min(0).max(1),
});

export type KuboLaunchProps = z.infer<typeof kuboLaunchSchema>;

export const defaultKuboLaunchProps: KuboLaunchProps = {
  command: "bun create kubojs",
  /** Set to `audio/launch-bed.mp3` after dropping a file in public/audio/. */
  musicFile: null,
  musicVolume: 0.45,
};
