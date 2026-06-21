export const TASK_ATTACHMENTS_BUCKET = "task-attachments";
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const ATTACHMENT_ACCEPT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".pdf",
  ".txt",
  ".csv",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
].join(",");

type FileRule = {
  contentType: string;
  acceptedTypes: string[];
};

const fileRules: Record<string, FileRule> = {
  jpg: { contentType: "image/jpeg", acceptedTypes: ["image/jpeg"] },
  jpeg: { contentType: "image/jpeg", acceptedTypes: ["image/jpeg"] },
  png: { contentType: "image/png", acceptedTypes: ["image/png"] },
  gif: { contentType: "image/gif", acceptedTypes: ["image/gif"] },
  webp: { contentType: "image/webp", acceptedTypes: ["image/webp"] },
  avif: { contentType: "image/avif", acceptedTypes: ["image/avif"] },
  pdf: { contentType: "application/pdf", acceptedTypes: ["application/pdf"] },
  txt: { contentType: "text/plain", acceptedTypes: ["text/plain"] },
  csv: {
    contentType: "text/csv",
    acceptedTypes: ["text/csv", "application/vnd.ms-excel"],
  },
  doc: {
    contentType: "application/msword",
    acceptedTypes: ["application/msword"],
  },
  docx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  xls: {
    contentType: "application/vnd.ms-excel",
    acceptedTypes: ["application/vnd.ms-excel"],
  },
  xlsx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  ppt: {
    contentType: "application/vnd.ms-powerpoint",
    acceptedTypes: ["application/vnd.ms-powerpoint"],
  },
  pptx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
};

export type AttachmentFileInput = {
  name: string;
  type: string;
  size: number;
};

export type AttachmentValidationResult =
  | { success: true; contentType: string }
  | { success: false; message: string };

export function validateAttachmentFile(
  file: AttachmentFileInput,
): AttachmentValidationResult {
  const name = file.name.trim();
  if (!name || name.length > 255) {
    return {
      success: false,
      message: "Choose a file with a name between 1 and 255 characters.",
    };
  }

  if (file.size < 1) {
    return { success: false, message: "Empty files cannot be uploaded." };
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return { success: false, message: "Files must be 10 MB or smaller." };
  }

  const extension = name.includes(".")
    ? name.split(".").pop()?.toLowerCase()
    : undefined;
  const rule = extension ? fileRules[extension] : undefined;
  if (!rule) {
    return {
      success: false,
      message: "Use an image, PDF, TXT, CSV, Word, Excel, or PowerPoint file.",
    };
  }

  if (
    file.type &&
    file.type !== "application/octet-stream" &&
    !rule.acceptedTypes.includes(file.type.toLowerCase())
  ) {
    return {
      success: false,
      message: "The file content type does not match its extension.",
    };
  }

  return { success: true, contentType: rule.contentType };
}

export function formatAttachmentSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.ceil(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
