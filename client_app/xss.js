const sanitizeJsonBody = (req, res, next) => {
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === "string") {
      req.body[key] = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }
  next();
};

export { sanitizeJsonBody };
