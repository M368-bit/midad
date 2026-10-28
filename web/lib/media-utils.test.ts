import { describe, it, expect } from "vitest";
import {
  formatMediaTime,
  calculateProgressPercent,
  clampVolume,
  isValidPlaybackRate,
  SUPPORTED_PLAYBACK_RATES,
} from "./media-utils";

describe("Media Utils (MIDAD Players 2026)", () => {
  it("formats seconds into mm:ss accurately", () => {
    expect(formatMediaTime(0)).toBe("00:00");
    expect(formatMediaTime(45)).toBe("00:45");
    expect(formatMediaTime(60)).toBe("01:00");
    expect(formatMediaTime(75)).toBe("01:15");
    expect(formatMediaTime(599)).toBe("09:59");
    expect(formatMediaTime(600)).toBe("10:00");
  });

  it("formats hours into h:mm:ss for long lectures", () => {
    expect(formatMediaTime(3600)).toBe("1:00:00");
    expect(formatMediaTime(3665)).toBe("1:01:05");
    expect(formatMediaTime(7325)).toBe("2:02:05");
  });

  it("handles negative and NaN times safely without crashing", () => {
    expect(formatMediaTime(-10)).toBe("00:00");
    expect(formatMediaTime(NaN)).toBe("00:00");
  });

  it("calculates progress percent accurately and clamps between 0 and 100", () => {
    expect(calculateProgressPercent(0, 100)).toBe(0);
    expect(calculateProgressPercent(50, 100)).toBe(50);
    expect(calculateProgressPercent(100, 100)).toBe(100);
    expect(calculateProgressPercent(150, 100)).toBe(100);
    expect(calculateProgressPercent(-10, 100)).toBe(0);
    expect(calculateProgressPercent(50, 0)).toBe(0);
    expect(calculateProgressPercent(50, NaN)).toBe(0);
  });

  it("clamps volume between 0 and 1", () => {
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(-0.2)).toBe(0);
    expect(clampVolume(1.5)).toBe(1);
    expect(clampVolume(NaN)).toBe(1);
  });

  it("validates supported playback rates", () => {
    expect(isValidPlaybackRate(0.75)).toBe(true);
    expect(isValidPlaybackRate(1)).toBe(true);
    expect(isValidPlaybackRate(1.25)).toBe(true);
    expect(isValidPlaybackRate(1.5)).toBe(true);
    expect(isValidPlaybackRate(2)).toBe(true);

    expect(isValidPlaybackRate(0.5)).toBe(false);
    expect(isValidPlaybackRate(3)).toBe(false);
    expect(SUPPORTED_PLAYBACK_RATES).toHaveLength(5);
  });
});
