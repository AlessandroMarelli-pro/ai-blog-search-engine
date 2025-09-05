#!/usr/bin/env python3
"""
RSS Feed Fetcher Script
Fetches blog posts from RSS feeds and returns them as JSON
"""

import argparse
import json
import os
import re
import ssl
import sys
import time
from datetime import datetime
from urllib.parse import urlparse

import feedparser
from bs4 import BeautifulSoup
from db_service import get_themes_and_tags
from embed_text import embed_text

# Embeddings

# Lazy global model
_model = None


def log_debug(enabled: bool, *args):
    if enabled:
        print("[fetch_rss][DEBUG]", *args, file=sys.stderr, flush=True)


def clean_text(text):
    """Clean HTML tags and normalize text"""
    if not text:
        return ""

    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_tags_by_theme(title, description, themes: list[tuple[any, ...]]):
    """
    For each theme, check if some tags are in the title or the description.
    If so, add the theme and the matching tags to an array.
    Return the array at the end.
    """
    results = []
    text = f"{title} {description}".lower()

    for theme in themes:
        theme_name = theme[0]
        tags = theme[1].split(",")
        matched_tags = [tag for tag in tags if tag.lower() in text]
        if matched_tags:
            results.append(
                {
                    "theme": theme_name,
                    "tags": matched_tags,  # Limit to 5 tags per theme
                }
            )
    return results


def fetch_rss_feed(url, source, debug: bool = False):
    try:
        themes = get_themes_and_tags()
        t0 = time.time()
        if hasattr(ssl, "_create_unverified_context"):
            ssl._create_default_https_context = ssl._create_unverified_context

        log_debug(debug, f"parsing feed: {url}")
        feed = feedparser.parse(url)
        if feed.bozo:
            print(f"Error parsing RSS feed: {feed.bozo_exception}", file=sys.stderr)
            return []

        posts = []
        for i, entry in enumerate(feed.entries):
            title = clean_text(entry.get("title", ""))
            description = clean_text(entry.get("description", ""))
            link = entry.get("link", "")

            author = ""
            if hasattr(entry, "author"):
                author = entry.author
            elif hasattr(entry, "dc_creator"):
                author = entry.dc_creator

            published_at = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published_at = datetime(*entry.published_parsed[:6]).isoformat()
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                published_at = datetime(*entry.updated_parsed[:6]).isoformat()

            content = description
            if hasattr(entry, "content") and entry.content:
                content = clean_text(entry.content[0].value)
            elif hasattr(entry, "summary"):
                content = clean_text(entry.summary)

            tagsByTheme = extract_tags_by_theme(title, description, themes)
            embedding = embed_text([title, description, content], debug)

            post = {
                "title": title,
                "description": description,
                "content": content,
                "author": author,
                "url": link,
                "publishedAt": published_at,
                "themes": [x["theme"] for x in tagsByTheme],
                "tags": [",".join(x["tags"]) for x in tagsByTheme],
                "source": source,
                "embedding": embedding,
            }
            posts.append(post)

            if debug and i < 3:
                log_debug(
                    True,
                    f"sample post[{i}] title='{title[:80]}' embedding={'yes' if embedding else 'no'}",
                )

        log_debug(debug, f"parsed {len(posts)} posts in {time.time() - t0:.2f}s")
        return posts

    except Exception as e:
        print(f"Error fetching RSS feed: {str(e)}", file=sys.stderr)
        return []


def main():
    parser = argparse.ArgumentParser(description="Fetch RSS feed data")
    parser.add_argument("--url", required=True, help="RSS feed URL")
    parser.add_argument("--source", required=True, help="Source name")
    parser.add_argument(
        "--debug", action="store_true", help="Enable verbose debug logs to stderr"
    )

    args = parser.parse_args()
    debug = args.debug or os.environ.get("PYTHON_DEBUG") == "1"
    posts = fetch_rss_feed(args.url, args.source, debug)
    print(json.dumps(posts, indent=2))


if __name__ == "__main__":
    main()
