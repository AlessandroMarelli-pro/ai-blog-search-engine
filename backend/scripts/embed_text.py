#!/usr/bin/env python3
"""
Text Embedding Script
Transforms text into embeddings
"""

import argparse
import json
import os
import sys
import time

# Embeddings
from sentence_transformers import SentenceTransformer

# Lazy global model
_model = None


def log_debug(enabled: bool, *args):
    if enabled:
        print("[embed_text][DEBUG]", *args, file=sys.stderr, flush=True)


def get_model(debug: bool = False):
    global _model
    if _model is None:
        t0 = time.time()
        log_debug(
            debug, "loading embedding model: sentence-transformers/all-MiniLM-L6-v2 ..."
        )
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        log_debug(debug, f"model loaded in {time.time() - t0:.2f}s")
    return _model


def embed_text(texts, debug: bool = False):
    """
    Embed an array of strings (e.g., [title, description, content]) into a vector.
    """
    model = get_model(debug)
    # Filter out empty/None strings, join with space
    combined = " ".join([t for t in texts if t]).strip()
    if not combined:
        return None
    vec = model.encode(combined, normalize_embeddings=True)
    if debug:
        log_debug(
            True,
            f"embedding dims={len(vec)} range=({float(min(vec)):.4f},{float(max(vec)):.4f})",
        )
    return vec.tolist()


def main():
    parser = argparse.ArgumentParser(description="Transform text into embeddings")
    parser.add_argument("--query", required=True, help="Text to embed")
    parser.add_argument(
        "--debug", action="store_true", help="Enable verbose debug logs to stderr"
    )

    args = parser.parse_args()
    debug = args.debug or os.environ.get("PYTHON_DEBUG") == "1"

    embeddings = embed_text([args.query], debug)
    print(json.dumps(embeddings, indent=2))


if __name__ == "__main__":
    main()
