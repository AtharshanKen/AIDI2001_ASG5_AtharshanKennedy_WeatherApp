import json
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
