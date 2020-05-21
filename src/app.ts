import express, { Request, Response, NextFunction } from "express";
import compression from "compression";  // compresses requests
import lusca from "lusca";
import helmet from "helmet";
import { secrets } from "./util/secrets";
import fileUpload from "express-fileupload";
import logger from "./util/logger";

// Controllers (route handlers)
import importRouter from "./controllers/import";

import responseTime from "response-time";

// Create Express server
const app = express();

app.use(responseTime());

app.use((req, res, next) => {
  if (req.query.token !== secrets.API_KEY) {
    res.status(401).send("Authentication required.");
    return;
  }
  return next();
});

app.use(helmet({ dnsPrefetchControl: { allow: true } }));


// Express configuration
app.set("trust proxy", true);
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(fileUpload());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

/**
 * Primary app routes.
 */
app.use("/import", importRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).send("Internal server"); // phone-calls-backup
});

export default app;
