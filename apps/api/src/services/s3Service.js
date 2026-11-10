import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  allowedImageTypes,
  bucketName,
  maximumImageSize,
  s3Client,
} from '../config/s3.js';

export class ImageStorageUnavailableError extends Error {
  constructor() {
    super('Image storage is not configured on this server.');
    this.statusCode = 503;
  }
}

function requireStorage() {
  if (!s3Client || !bucketName) {
    throw new ImageStorageUnavailableError();
  }
}

export async function createImageUpload(userId, contentType, size) {
  requireStorage();

  if (!allowedImageTypes.has(contentType)) {
    const error = new Error('Choose a JPG, PNG, or WebP image.');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(size) || size < 1 || size > maximumImageSize) {
    const error = new Error('Image must be no larger than 5 MB.');
    error.statusCode = 400;
    throw error;
  }

  const imageKey = `${userId}/${randomUUID()}`;
  const signedPost = await createPresignedPost(s3Client, {
    Bucket: bucketName,
    Key: imageKey,
    Expires: 300,
    Fields: { 'Content-Type': contentType },
    Conditions: [
      ['content-length-range', 1, maximumImageSize],
      ['eq', '$Content-Type', contentType],
    ],
  });

  return { ...signedPost, imageKey };
}

export async function createImageViewUrl(imageKey) {
  requireStorage();
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: bucketName, Key: imageKey }),
    { expiresIn: 300 },
  );
}

export async function deleteImage(imageKey) {
  requireStorage();
  return s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: imageKey }));
}
