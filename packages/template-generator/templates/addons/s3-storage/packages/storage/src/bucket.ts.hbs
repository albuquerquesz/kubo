export type BucketConfig = {
  bucket: string;
};

export type BucketUploadInput = {
  key: string;
  body: string | Uint8Array | ArrayBuffer;
  contentType?: string;
  metadata?: Record<string, string>;
};

export abstract class Bucket<TObject = unknown> {
  protected readonly bucket: string;

  protected constructor(config: BucketConfig) {
    this.bucket = config.bucket;
  }

  abstract upload(input: BucketUploadInput): Promise<void>;

  abstract download(key: string): Promise<TObject>;

  abstract exists(key: string): Promise<boolean>;

  abstract delete(key: string): Promise<void>;

  abstract getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
