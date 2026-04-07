import json
import os
from pathlib import Path


class LocalArtifactStorage:
    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root

    def write_json(self, artifact_key: str, payload: dict) -> None:
        path = self.output_root / artifact_key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


class GcpBucketArtifactStorage:
    def __init__(self, bucket, prefix: str = "") -> None:
        self.bucket = bucket
        self.prefix = prefix.strip("/")

    def write_json(self, artifact_key: str, payload: dict) -> None:
        blob_key = build_blob_key(prefix=self.prefix, artifact_key=artifact_key)
        blob = self.bucket.blob(blob_key)
        blob.upload_from_string(
            json.dumps(payload, indent=2),
            content_type="application/json",
        )


def build_blob_key(*, prefix: str, artifact_key: str) -> str:
    if not prefix:
        return artifact_key
    return f"{prefix}/{artifact_key}"


def create_storage_from_environment(*, output_root: Path):
    storage_mode = os.environ.get("WEATHER_STORAGE_MODE", "local").lower()

    if storage_mode == "local":
        return LocalArtifactStorage(output_root)
    if storage_mode == "gcp":
        bucket_name = os.environ.get("WEATHER_BUCKET_NAME")
        if not bucket_name:
            raise ValueError("WEATHER_BUCKET_NAME is required for gcp storage mode")

        bucket_prefix = os.environ.get("WEATHER_BUCKET_PREFIX", "")
        bucket = load_google_cloud_bucket(bucket_name)
        return GcpBucketArtifactStorage(bucket=bucket, prefix=bucket_prefix)

    raise ValueError(f"Unsupported storage mode: {storage_mode}")


def load_google_cloud_bucket(bucket_name: str):
    try:
        from google.cloud import storage as google_cloud_storage
    except ImportError as error:
        raise RuntimeError(
            "google-cloud-storage is required for gcp storage mode"
        ) from error

    client = google_cloud_storage.Client()
    return client.bucket(bucket_name)
