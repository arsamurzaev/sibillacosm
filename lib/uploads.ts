import { randomUUID } from "node:crypto";
import { unlink, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { slugify } from "./utils";

const LEGACY_UPLOADS_PREFIX = "/uploads/";
const MEDIA_FALLBACK_FOLDER = "uploads";

type ObjectStorageConfig = {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
};

let s3Client: S3Client | null = null;

function getObjectStorageConfig(): ObjectStorageConfig | null {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const region = process.env.S3_REGION?.trim() || "us-east-1";
  const publicBaseUrl =
    process.env.S3_PUBLIC_BASE_URL?.trim() ||
    `${endpoint.replace(/\/+$/, "")}/${encodeURIComponent(bucket)}`;

  return {
    endpoint,
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
}

function getS3Client(config: ObjectStorageConfig) {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

function createObjectKey(folder: string, extension: string) {
  const safeFolder = slugify(folder) || MEDIA_FALLBACK_FOLDER;
  return path.posix.join(safeFolder, `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`);
}

function encodeObjectKey(objectKey: string) {
  return objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function extractObjectKeyFromUrl(imageUrl: string, config: ObjectStorageConfig) {
  try {
    const image = new URL(imageUrl);
    const base = new URL(config.publicBaseUrl);

    if (image.origin !== base.origin) {
      return null;
    }

    const basePath = base.pathname.replace(/\/+$/, "");
    if (!image.pathname.startsWith(`${basePath}/`)) {
      return null;
    }

    return decodeURIComponent(image.pathname.slice(basePath.length + 1));
  } catch {
    return null;
  }
}

export async function saveUploadedFile(file: File, folder: string) {
  if (!file || file.size === 0) {
    return "";
  }

  const extension = path.extname(file.name) || ".bin";
  const objectStorageConfig = getObjectStorageConfig();

  if (objectStorageConfig) {
    const objectKey = createObjectKey(folder, extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    await getS3Client(objectStorageConfig).send(
      new PutObjectCommand({
        Bucket: objectStorageConfig.bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type || undefined,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return `${objectStorageConfig.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
  }

  const baseName = slugify(path.basename(file.name, extension)) || "upload";
  const fileName = `${Date.now()}-${baseName}${extension.toLowerCase()}`;
  const relativeDirectory = path.join("uploads", folder);
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  const absolutePath = path.join(absoluteDirectory, fileName);
  await mkdir(absoluteDirectory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return `/${relativeDirectory.replaceAll("\\", "/")}/${fileName}`;
}

export async function deleteUploadedFile(imageUrl: string) {
  const objectStorageConfig = getObjectStorageConfig();

  if (objectStorageConfig) {
    const objectKey = extractObjectKeyFromUrl(imageUrl, objectStorageConfig);
    if (objectKey) {
      await getS3Client(objectStorageConfig).send(
        new DeleteObjectCommand({
          Bucket: objectStorageConfig.bucket,
          Key: objectKey,
        }),
      );

      return;
    }
  }

  if (!imageUrl.startsWith(LEGACY_UPLOADS_PREFIX)) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));

  try {
    await unlink(absolutePath);
  } catch {
    // The file may already be absent from disk; database state remains authoritative.
  }
}
