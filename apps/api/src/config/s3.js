import { S3Client } from '@aws-sdk/client-s3';

export const bucketName = process.env.S3_BUCKET;
export const s3Client = bucketName
  ? new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' })
  : null;

export const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const maximumImageSize = 5 * 1024 * 1024;
