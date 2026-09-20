"""Export FastAPI OpenAPI without starting a web server."""
import argparse
import json
from pathlib import Path

from app.platform.application import create_platform


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    app = create_platform(database_url="sqlite:///:memory:", sandbox=True)
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
