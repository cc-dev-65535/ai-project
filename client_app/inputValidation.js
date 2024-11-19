const sanitizeJsonBody = (req, res, next) => {
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === "string") {
      req.body[key] = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }
  next();
};

const checkEmail = (req, res, next) => {
  const email = req.body.username;
  const regex_email = /^\S+@\S+\.\S+$/;
  if (!regex_email.test(email)) {
    res.status(400).send({ message: "Invalid email" });
    return;
  }
  next();
};

export { sanitizeJsonBody, checkEmail };
