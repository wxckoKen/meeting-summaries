import {
  ACCEPTED_AUDIO_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from "@/types";

describe("Type constants", () => {
  it("accepts standard audio formats", () => {
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/mpeg");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/wav");
    expect(ACCEPTED_AUDIO_TYPES).toContain("audio/m4a");
  });

  it("sets max file size to 50MB", () => {
    expect(MAX_FILE_SIZE_MB).toBe(50);
    expect(MAX_FILE_SIZE_BYTES).toBe(50 * 1024 * 1024);
  });
});
