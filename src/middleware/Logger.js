const logger = (req, res, next) => {
  if (req.url.includes('/api/v1'))
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export default logger;