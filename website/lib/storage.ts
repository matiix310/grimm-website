import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "./env";

const ACCESS_KEY_ID = getEnv("S3_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = getEnv("S3_SECRET_ACCESS_KEY");
const ENDPOINT = getEnv("S3_URL");
const BUCKET_NAME = getEnv("S3_BUCKET_NAME");

const validEnv = ACCESS_KEY_ID && SECRET_ACCESS_KEY && ENDPOINT && BUCKET_NAME;

if (!validEnv) {
  console.warn("S3 environment variables are not set. Disabling S3 storage.");
}

const s3 = validEnv
  ? new S3Client({
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
      region: "garage",
      endpoint: ENDPOINT,
      forcePathStyle: true,
    })
  : undefined;

export const loadAssetFromStorage = async (path: string): Promise<string | undefined> => {
  if (!s3) return undefined;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    const url = await getSignedUrl(s3, command);
    return url;
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    return undefined;
  }
};
