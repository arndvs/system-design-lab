import type { Component } from "../types";

export const objectStorage: Component = {
  id: "object-storage",
  name: "Object Storage",
  layer: "data",
  oneLiner: "Keeps files of any size, like photos, videos and exports, cheaply and durably, addressed by a name.",
  howItWorks:
    "You store each file as an object in a bucket under a key, along with some metadata. The provider copies it across devices and zones for durability. Clients can upload or download directly with short-lived signed URLs, so large transfers don't pass through your application servers.",
  addWhen: [
    "Users upload or download images, video, audio or documents.",
    "You need somewhere cheap to keep backups, logs or data exports.",
    "Files are too large to sit comfortably in a database row.",
  ],
  skipWhen: [
    "You need to edit small parts of a file in place; objects are replaced whole.",
    "The data is small structured records that belong in a database.",
  ],
  tradeoffs: [
    {
      cost: "Each request has tens of milliseconds of latency, too slow for data read on every page view.",
      mitigation: "Serve popular files through a CDN and keep hot metadata in the database or cache.",
    },
    {
      cost: "A misconfigured bucket policy can expose every file publicly.",
      mitigation: "Block public access by default and hand out signed URLs that expire.",
    },
    {
      cost: "Storage that is never cleaned up grows forever.",
      mitigation: "Use lifecycle rules to move old objects to colder tiers and delete what's past retention.",
    },
  ],
  interviewAngle:
    "Expect questions on how uploads flow (direct to storage with a signed URL), where metadata lives, and how files reach users through a CDN.",
  tools: [
    { name: "Amazon S3", kind: "managed" },
    { name: "Google Cloud Storage", kind: "managed" },
    { name: "Azure Blob Storage", kind: "managed" },
    { name: "MinIO", kind: "self-hosted" },
  ],
  related: ["cdn", "relational-database"],
  glossary: ["signed-url", "origin"],
  sources: [
    { title: "Amazon S3 User Guide: What is Amazon S3?", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" },
    {
      title: "Amazon S3 User Guide: Sharing objects with presigned URLs",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
    },
  ],
};
