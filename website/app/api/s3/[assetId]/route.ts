// app/api/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ApiResponse from "@/lib/apiResponse";
import path from "path";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: "garage",
  endpoint: process.env.S3_URL!,
  forcePathStyle: true,
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/s3/[assetId]">) {
  try {
    const assetId = (await ctx.params).assetId;

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: assetId,
    });

    const url = await getSignedUrl(s3, command);

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    return ApiResponse.internalServerError();
  }
}
