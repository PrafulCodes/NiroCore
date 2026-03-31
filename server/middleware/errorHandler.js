export default function errorHandler(err, req, res, next) {
  console.error('[NiroCore Error]', err.message);

  if (err.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Record not found.' 
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'File too large. Max 10MB.' 
    });
  }

  if (err.message?.includes('ENOENT')) {
    return res.status(500).json({ 
      error: 'File processing failed.' 
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  });
}
