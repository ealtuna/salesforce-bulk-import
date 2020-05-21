import { Router } from "express";
import { Readable } from "stream";
import fileUpload from "express-fileupload";

import { SfBulkJobApi } from "../services/sf-bulk-job-api";

const router = Router();

function toStream(source: string | Buffer): Readable {
    const readable = new Readable();
    readable.push(source);
    readable.push(null);
    return readable;
}

router.post("/", async (req, res, next) => {
    try {
        const { objectType, operation, extIdField } = req.body;
        
        const transformationSpec = toStream((req.files.transformationSpec as fileUpload.UploadedFile).data);
        const importData = toStream((req.files.importData as fileUpload.UploadedFile).data);
        
        const batchResponse = await (await SfBulkJobApi.create()).executeJob(objectType, operation, extIdField, importData, transformationSpec);
        const successOperations = batchResponse.filter(o => o.success);
        const failedOperations = batchResponse.filter(o => !o.success);

        res.status(200).send({
            success: {
                total: successOperations.length,
                ops: successOperations
            },
            failed: {
                total: failedOperations.length,
                ops: failedOperations
            }
        });
    } catch (e) {
        console.log(JSON.stringify(e));
        return next(e);
    }
});

export default router;