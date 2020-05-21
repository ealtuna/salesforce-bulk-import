import { Connection, Job } from "jsforce";
import { Readable } from "stream";

import { secrets } from "../util/secrets";
import { SfBulkJobExtendedAdapter } from "./sf-bulk-job-extended-adapter";

const POOL_INTERVAL = 1000;
const POOL_TIMEOUT = 3600000;

export interface BatchRecordResponse {
    id: string | null;
    success: boolean;
    errors: string[];
}

export class SfBulkJobApi {

    private constructor(private connection: Connection) {}

    public static async create(): Promise<SfBulkJobApi> {
        const connection = new Connection({ loginUrl: secrets.SF_LOGIN_URL });
        await connection.login(secrets.SF_USERNAME, secrets.SF_PASSWORD_PLUS_TOKEN);
        return new SfBulkJobApi(connection);
    }

    async executeJob(objectType: string, operation: string, extIdField: string, importData: Readable, transformationSpec: Readable): Promise<BatchRecordResponse[]> {
        const job: Job = this.connection.bulk.createJob(objectType, operation, { extIdField });
        const sfBulkJobExtendedAdapter = new SfBulkJobExtendedAdapter(this.connection, job);
        await sfBulkJobExtendedAdapter.setTransformationSpec(transformationSpec);
        return this.executeBatches(job, importData);
    }

    private async executeBatches(job: Job, batchedRecords: Readable): Promise<BatchRecordResponse[]> {
        const batch = job.createBatch();
        await new Promise((resolve, reject) => {
            batch.execute(batchedRecords)
                .on("queue", function (batchInfo) {
                    return resolve(batchInfo);
                })
                .on("error", function (err) {
                    return reject(err);
                });
        });
        return new Promise<BatchRecordResponse[]>((resolve, reject) => {
            batch.poll(POOL_INTERVAL, POOL_TIMEOUT);
            batch.on("error", (err) => {
                reject(err);
            }).on("response", (response: BatchRecordResponse[]) => {
                resolve(response);
            });
        });
    }
}
