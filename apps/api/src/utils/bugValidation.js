const validSeverities = ['low', 'med', 'high'];
const validStatuses = ['open', 'in-progress', 'closed'];

export function validateBugFields(body, { partial = false } = {}) {
  const fields = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120) {
      fields.title = 'Enter a title (up to 120 characters).';
    }
  }

  if (body.description !== undefined
    && (typeof body.description !== 'string' || body.description.length > 5000)) {
    fields.description = 'Description must be 5,000 characters or fewer.';
  }

  if (body.severity !== undefined && !validSeverities.includes(body.severity)) {
    fields.severity = 'Choose low, med, or high.';
  }

  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    fields.status = 'Choose open, in-progress, or closed.';
  }

  if (body.imageKey !== undefined && typeof body.imageKey !== 'string') {
    fields.imageKey = 'Invalid image reference.';
  }

  return fields;
}

export function isValidBugStatus(status) {
  return validStatuses.includes(status);
}
