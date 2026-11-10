export function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (error.name === 'CastError') {
    return response.status(404).json({ error: 'Bug not found.' });
  }

  return response.status(error.statusCode || 500).json({
    error: 'Something went wrong. Please try again.',
  });
}
