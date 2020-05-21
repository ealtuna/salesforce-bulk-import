import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";
import Joi from "@hapi/joi";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".env.example" });  // you can delete this after you create your own .env file!
}

export enum Environments {
    Development = "development",
    Production = "production",
    Test = "test"
}

export enum PostMethodEnvironments {
    Development = "development",
    Production = "production"
}

interface Secrets {
    NODE_ENV: string;
    API_KEY: string;
    SF_LOGIN_URL: string;
    SF_USERNAME: string;
    SF_PASSWORD_PLUS_TOKEN: string;
}

const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(Environments.Development, Environments.Production, Environments.Test)
        .default(Environments.Development),
    API_KEY: Joi.string().required(),
    SF_LOGIN_URL: Joi.string().required(),
    SF_USERNAME: Joi.string().required(),
    SF_PASSWORD_PLUS_TOKEN: Joi.string().required()
})
    .unknown()
    .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const secrets: Secrets = envVars as any;