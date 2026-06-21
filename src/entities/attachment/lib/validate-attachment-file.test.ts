import { describe, expect, it } from "vitest";

import {
  MAX_ATTACHMENT_SIZE,
  validateAttachmentFile,
} from "./validate-attachment-file";

describe("validateAttachmentFile", () => {
  it("accepts a matching image", () => {
    expect(
      validateAttachmentFile({
        name: "mockup.png",
        type: "image/png",
        size: 2048,
      }),
    ).toEqual({ success: true, contentType: "image/png" });
  });

  it("normalizes an Office file without a browser MIME type", () => {
    expect(
      validateAttachmentFile({ name: "brief.docx", type: "", size: 4096 }),
    ).toEqual({
      success: true,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  });

  it("accepts a generic browser MIME type for an allowed extension", () => {
    expect(
      validateAttachmentFile({
        name: "data.csv",
        type: "application/octet-stream",
        size: 10,
      }),
    ).toEqual({ success: true, contentType: "text/csv" });
  });

  it("rejects files above 10 MB", () => {
    expect(
      validateAttachmentFile({
        name: "large.pdf",
        type: "application/pdf",
        size: MAX_ATTACHMENT_SIZE + 1,
      }),
    ).toEqual({ success: false, message: "Files must be 10 MB or smaller." });
  });

  it("rejects empty files", () => {
    expect(
      validateAttachmentFile({
        name: "empty.txt",
        type: "text/plain",
        size: 0,
      }),
    ).toEqual({ success: false, message: "Empty files cannot be uploaded." });
  });

  it("rejects disallowed extensions", () => {
    expect(
      validateAttachmentFile({
        name: "script.exe",
        type: "application/octet-stream",
        size: 100,
      }),
    ).toEqual({
      success: false,
      message: "Use an image, PDF, TXT, CSV, Word, Excel, or PowerPoint file.",
    });
  });

  it("rejects an extension and MIME mismatch", () => {
    expect(
      validateAttachmentFile({
        name: "fake.pdf",
        type: "image/png",
        size: 100,
      }),
    ).toEqual({
      success: false,
      message: "The file content type does not match its extension.",
    });
  });
});
