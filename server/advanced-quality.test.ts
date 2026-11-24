import { describe, expect, it } from "vitest";
import { generateMIDI, parseLyricsStructure } from "./export-helpers";

// No external API or content. Reproducible fuzz corpus with fixed PRNG.
function generate(seed: number): string {
  let state = seed >>> 0;
  const next = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) % 8);
  return Array.from({ length: seed % 100 + 1 }, (_, i) =>
    i % 11 === 0 ? "[Verse]" : next() === 0 ? "" : "lyric ".repeat(next() + 1)
  ).join("\n");
}

describe("advanced source-only properties — lyrics and MIDI", () => {
  it("preserves line-count invariants for generated lyrics", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const content = generate(seed);
      const parsed = parseLyricsStructure(content);
      expect(parsed.totalLines).toBe(content.split("\n").length);
      expect(parsed.sections.every(section => section.lines > 0)).toBe(true);
      expect(parsed.sections.reduce((n, section) => n + section.lines, 0))
        .toBeLessThanOrEqual(parsed.totalLines);
    }
  });
  it("emits internally consistent MIDI track lengths", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const content = generate(seed);
      const midi = generateMIDI({ content } as never);
      expect(midi.toString("ascii", 0, 4)).toBe("MThd");
      expect(midi.toString("ascii", 14, 18)).toBe("MTrk");
      expect(midi.readUInt32BE(18)).toBe(midi.length - 22);
      expect(midi.subarray(-4).toString("hex")).toBe("00ff2f00");
    }
  });
});
