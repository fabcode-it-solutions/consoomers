"use server";

import { FileMetadata, getFileMetadata } from "@/utils/getFileMetaData";
import { v4 as uuidv4 } from "uuid";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

interface ProcessedFile {
  buffer: Buffer;
  key: string;
  contentType: string;
}

interface UploadResult {
  url: string;
  originalFileName: string;
  uploadedKey: string;
  contentType: string;
  metadata?: FileMetadata | unknown;
  base64?: string;
  id?: string;
}

interface UploadOptions {
  file: File;
  folder: string;
  includeBase64?: boolean;
  customFileName?: string;
}

const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
} as const;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validates file before processing
 */
function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed size of ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`
    );
  }

  if (!file.name.trim()) {
    throw new Error("File must have a valid name");
  }

  // Check for potentially dangerous files
  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
  ];
  const fileName = file.name.toLowerCase();
  if (dangerousExtensions.some((ext) => fileName.endsWith(ext))) {
    throw new Error("File type not allowed for security reasons");
  }
}

/**
 * Generates a safe S3 key from filename
 */
function generateS3Key(fileName: string, customName?: string): string {
  const nameToUse = customName || fileName;

  // Extract extension
  const lastDotIndex = nameToUse.lastIndexOf(".");
  const baseName =
    lastDotIndex > 0 ? nameToUse.substring(0, lastDotIndex) : nameToUse;
  const extension = lastDotIndex > 0 ? nameToUse.substring(lastDotIndex) : "";

  // Clean the base name
  const safeName = baseName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();

  // Add timestamp to avoid conflicts
  const timestamp = Date.now();

  return `${safeName}_${timestamp}${extension}`;
}

/**
 * Converts file to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}

/**
 * Processes a file for upload
 */
async function processFile(
  file: File,
  customFileName?: string
): Promise<ProcessedFile> {
  validateFile(file);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    buffer,
    key: generateS3Key(file.name, customFileName),
    contentType: file.type || "application/octet-stream",
  };
}

/**
 * Uploads a single file to S3
 */
export async function uploadFileToS3({
  file,
  folder,
  includeBase64 = false,
  customFileName,
}: UploadOptions): Promise<UploadResult> {
  if (!folder.trim()) {
    throw new Error("Folder parameter cannot be empty");
  }

  try {
    const { buffer, key, contentType } = await processFile(
      file,
      customFileName
    );

    // Sanitize folder path
    const sanitizedFolder = folder
      .replace(/[^a-zA-Z0-9/_-]/g, "_")
      .replace(/\/{2,}/g, "/");
    const fullKey = `${sanitizedFolder.replace(/^\/|\/$/g, "")}/${key}`;

    const params = {
      Bucket: requiredEnvVars.AWS_S3_BUCKET_NAME,
      Key: fullKey,
      Body: buffer,
      ContentType: contentType,
      // Add metadata
      Metadata: {
        "original-name": file.name,
        "upload-timestamp": new Date().toISOString(),
        "file-size": file.size.toString(),
      },
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const url = `https://${requiredEnvVars.AWS_S3_BUCKET_NAME}.s3.${requiredEnvVars.AWS_REGION}.amazonaws.com/${fullKey}`;

    const result: UploadResult = {
      url,
      originalFileName: file.name,
      uploadedKey: fullKey,
      contentType,
        id: uuidv4(),
    };

    // Include base64 if requested
    if (includeBase64) {
      result.base64 = await fileToBase64(file);
    }

    return {
      ...result,
    };
  } catch (error) {
    console.log(error);
    throw new Error(
      `Failed to upload file "${file.name}": ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function deleteFile(fileKey: string) {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: [
          {
            Key: fileKey.replace(
              `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
              ""
            ),
          },
        ],
        Quiet: true || false,
      },
    });

    const result = await s3.send(command);
    console.log(`✅ Deleted ${fileKey} from ${result}`);
    return result;
  } catch (err) {
    console.error("❌ Error deleting file:", err);
  }
}
