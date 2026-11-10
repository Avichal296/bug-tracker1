import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createImageUpload,
  createImageViewUrl,
  deleteImage,
} from '../services/s3Service.js';
import { isValidBugStatus, validateBugFields } from '../utils/bugValidation.js';

function serializeBug(bug) {
  return {
    id: bug.id,
    title: bug.title,
    description: bug.description,
    severity: bug.severity.toLowerCase(),
    status: bug.status === 'IN_PROGRESS' ? 'in-progress' : bug.status.toLowerCase(),
    imageKey: bug.imageKey,
    createdAt: bug.createdAt,
    updatedAt: bug.updatedAt,
  };
}

const severityValues = { low: 'LOW', med: 'MED', high: 'HIGH' };
const statusValues = { open: 'OPEN', 'in-progress': 'IN_PROGRESS', closed: 'CLOSED' };
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidId(id) {
  return idPattern.test(id);
}

function belongsToUser(imageKey, userId) {
  return !imageKey || imageKey.startsWith(`${userId}/`);
}

export const createUploadUrl = asyncHandler(async (request, response) => {
  const { contentType, size } = request.body || {};
  const signedPost = await createImageUpload(request.userId, contentType, size);
  response.json(signedPost);
});

export const createBug = asyncHandler(async (request, response) => {
  const fields = validateBugFields(request.body || {});

  if (Object.keys(fields).length) {
    return response.status(400).json({ error: 'Check the highlighted fields.', fields });
  }

  const imageKey = request.body.imageKey || '';
  if (!belongsToUser(imageKey, request.userId)) {
    return response.status(400).json({ error: 'Invalid image reference.' });
  }

  const bug = await prisma.bug.create({
    data: {
      userId: request.userId,
      title: request.body.title.trim(),
      description: request.body.description || '',
      severity: severityValues[request.body.severity || 'med'],
      status: statusValues[request.body.status || 'open'],
      imageKey,
    },
  });

  return response.status(201).json({ bug: serializeBug(bug) });
});

export const listBugs = asyncHandler(async (request, response) => {
  const filter = { userId: request.userId };
  const { status } = request.query;

  if (status && status !== 'all') {
    if (!isValidBugStatus(status)) {
      return response.status(400).json({ error: 'Unknown status filter.' });
    }

    filter.status = statusValues[status];
  }

  const bugs = await prisma.bug.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return response.json({ bugs: bugs.map(serializeBug) });
});

export const getBug = asyncHandler(async (request, response) => {
  if (!isValidId(request.params.id)) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  const bug = await prisma.bug.findFirst({
    where: { id: request.params.id, userId: request.userId },
  });

  if (!bug) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  const imageUrl = bug.imageKey ? await createImageViewUrl(bug.imageKey) : '';
  return response.json({ bug: serializeBug(bug), imageUrl });
});

export const updateBug = asyncHandler(async (request, response) => {
  const fields = validateBugFields(request.body || {}, { partial: true });

  if (Object.keys(fields).length) {
    return response.status(400).json({ error: 'Check the highlighted fields.', fields });
  }

  if (!isValidId(request.params.id)) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  const bug = await prisma.bug.findFirst({
    where: { id: request.params.id, userId: request.userId },
  });
  if (!bug) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  for (const field of ['title', 'description', 'severity', 'status']) {
    if (request.body[field] !== undefined) {
      if (field === 'title') bug.title = request.body.title.trim();
      if (field === 'description') bug.description = request.body.description;
      if (field === 'severity') bug.severity = severityValues[request.body.severity];
      if (field === 'status') bug.status = statusValues[request.body.status];
    }
  }

  if (request.body.imageKey !== undefined) {
    const nextImageKey = request.body.imageKey;

    if (!belongsToUser(nextImageKey, request.userId)) {
      return response.status(400).json({ error: 'Invalid image reference.' });
    }

    const previousImageKey = bug.imageKey;
    if (previousImageKey && previousImageKey !== nextImageKey) {
      await deleteImage(previousImageKey);
    }

    bug.imageKey = nextImageKey;
  }

  const updatedBug = await prisma.bug.update({
    where: { id: bug.id },
    data: {
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      status: bug.status,
      imageKey: bug.imageKey,
    },
  });
  return response.json({ bug: serializeBug(updatedBug) });
});

export const deleteBug = asyncHandler(async (request, response) => {
  if (!isValidId(request.params.id)) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  const bug = await prisma.bug.findFirst({
    where: { id: request.params.id, userId: request.userId },
  });

  if (!bug) {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  if (bug.imageKey) {
    await deleteImage(bug.imageKey);
  }

  await prisma.bug.delete({ where: { id: bug.id } });
  return response.json({ message: 'Bug deleted.' });
});
