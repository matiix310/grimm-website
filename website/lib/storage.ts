import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: "garage",
  endpoint: process.env.S3_URL!,
  forcePathStyle: true,
});

export const loadAssetFromStorage = async (path: string): Promise<string | undefined> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: path,
    });

    const url = await getSignedUrl(s3, command);
    return url;
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    return undefined;
  }
};
