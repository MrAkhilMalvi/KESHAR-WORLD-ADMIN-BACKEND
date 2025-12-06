const { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("config");
const cloud = config.get("App.cloude");

const R2uploedFrom = new S3Client({
  region: "auto",
  endpoint: `https://${cloud.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: cloud.R2_ACCESS_KEY,
    secretAccessKey: cloud.R2_SECRET_KEY,
  },
});

// Delete a single file
async function R2DeleteFrom(objectKey) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: cloud.R2_BUCKET,
      Key: objectKey
    });

    await R2uploedFrom.send(command);

    return { success: true, message: "File deleted from R2" };
  } catch (error) {
    console.error("R2 Delete Error:", error);
    return { success: false, message: "Failed to delete file" };
  }
}

// Delete all files with a prefix
async function deleteAllByPrefix(prefix) {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: cloud.R2_BUCKET,
      Prefix: prefix
    });

    const listResult = await R2uploedFrom.send(listCommand);

    if (!listResult.Contents || listResult.Contents.length === 0) {
      return { success: true, message: "No files to delete" };
    }

    const deleteParams = {
      Bucket: cloud.R2_BUCKET,
      Delete: { Objects: [] }
    };

    listResult.Contents.forEach(obj => {
      deleteParams.Delete.Objects.push({ Key: obj.Key });
    });

    await R2uploedFrom.send(new DeleteObjectsCommand(deleteParams));

    return { success: true, deleted: deleteParams.Delete.Objects.length };
  } catch (error) {
    console.error("Batch Delete Error:", error);
    return { success: false, message: "Failed to delete files" };
  }
}

module.exports = { R2uploedFrom, PutObjectCommand, getSignedUrl, R2DeleteFrom, deleteAllByPrefix };
