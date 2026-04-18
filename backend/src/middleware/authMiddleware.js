import jwt from "jsonwebtoken";

const JWT_SECRET = "2a9f4e6c8d1b7a5f3c9e2d6b8f4a1c7e9d5b3a6f8c2e4d7b1a9f3c6e8d2b5a1";

export const verifyToken = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token",
    });

  }

};