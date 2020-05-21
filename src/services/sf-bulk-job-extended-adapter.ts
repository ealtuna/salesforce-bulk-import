import { Readable } from "stream";
import { SuccessResult, ErrorResult, Connection, Job } from "jsforce";

export class SfBulkJobExtendedAdapter {
    constructor(private connection: Connection, private job: Job) {}

    public async setTransformationSpec(specStream: Readable): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const jobInfo = await this.job.open();
            specStream.pipe((this.connection.bulk as any)._request({
                method: "POST",
                path: "/job/" + jobInfo.id + "/spec",
                headers: {
                    "Content-Type": "text/csv"
                },
                responseType: "application/xml"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, function (err: any) {
                return !err ? resolve() : reject(err);
            }).stream());
        });
    }
}