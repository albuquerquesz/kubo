import { describe, expect, it } from "bun:test";

import { getKuboWalkPose, getKuboWalkX } from "../src/compositions/kubo-launch/lib/kubo-walk";
import {
  KUBO_WALK_END_FRAME,
  KUBO_WALK_END_X,
  KUBO_WALK_START_FRAME,
  KUBO_WALK_START_X,
  WALK_CYCLE_FRAMES,
} from "../src/compositions/kubo-launch/lib/timing";

describe("Kubo walk motion", () => {
  it("travels monotonically from right to left and stays at the final position", () => {
    const positions = Array.from({ length: 181 }, (_, frame) =>
      getKuboWalkX(
        frame,
        KUBO_WALK_START_FRAME,
        KUBO_WALK_END_FRAME,
        KUBO_WALK_START_X,
        KUBO_WALK_END_X,
      ),
    );

    for (let frame = KUBO_WALK_START_FRAME + 1; frame <= KUBO_WALK_END_FRAME; frame += 1) {
      expect(positions[frame]).toBeLessThanOrEqual(positions[frame - 1]);
    }

    expect(positions[KUBO_WALK_START_FRAME]).toBe(KUBO_WALK_START_X);
    expect(positions[KUBO_WALK_END_FRAME]).toBe(KUBO_WALK_END_X);
    expect(positions[180]).toBe(KUBO_WALK_END_X);
  });

  it("keeps the walk grounded without global vertical or scale motion", () => {
    for (let frame = 0; frame < WALK_CYCLE_FRAMES; frame += 1) {
      const pose = getKuboWalkPose(frame, WALK_CYCLE_FRAMES);

      expect(pose.bodyY).toBe(0);
      expect(pose.rootY).toBe(0);
      expect(pose.rootScale).toBe(1);
      expect(pose.rootRot).toBe(0);
      expect(pose.legLScaleY).toBe(1);
      expect(pose.legRScaleY).toBe(1);
    }
  });

  it("alternates the leading leg across the walk cycle", () => {
    const leftContact = getKuboWalkPose(0, WALK_CYCLE_FRAMES);
    const rightContact = getKuboWalkPose(WALK_CYCLE_FRAMES / 2, WALK_CYCLE_FRAMES);

    expect(leftContact.legLRot).toBeGreaterThan(leftContact.legRRot);
    expect(rightContact.legRRot).toBeGreaterThan(rightContact.legLRot);
  });
});
