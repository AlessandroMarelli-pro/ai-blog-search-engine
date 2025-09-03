#!/usr/bin/env python3
"""
Test Search Script
Debug search functionality and data indexing
"""

import argparse
import json
import sys

import requests


def test_elasticsearch_search(query, base_url="http://localhost:9200"):
    """Test Elasticsearch search directly"""
    try:
        # Test if Elasticsearch is running
        health_response = requests.get(f"{base_url}/_cluster/health")
        if health_response.status_code != 200:
            print(f"❌ Elasticsearch not accessible: {health_response.status_code}")
            return

        print(f"✅ Elasticsearch is running")

        # Check if index exists
        index_response = requests.get(f"{base_url}/blog-posts")
        if index_response.status_code != 200:
            print(f"❌ Index 'blog-posts' not found: {index_response.status_code}")
            return

        print(f"✅ Index 'blog-posts' exists")

        # Get document count
        count_response = requests.get(f"{base_url}/blog-posts/_count")
        if count_response.status_code == 200:
            count_data = count_response.json()
            print(f"📊 Total documents: {count_data.get('count', 0)}")

        # Test search
        search_body = {
            "query": {
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": [
                                    "title^3",
                                    "description^2",
                                    "content",
                                    "tags^2",
                                ],
                                "type": "phrase",
                                "boost": 3,
                            },
                        },
                        {
                            "multi_match": {
                                "query": query,
                                "fields": [
                                    "title^2",
                                    "description^1.5",
                                    "content",
                                    "tags",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                                "boost": 1,
                            },
                        },
                        {
                            "multi_match": {
                                "query": query,
                                "fields": [
                                    "title^1.5",
                                    "description",
                                    "content",
                                    "tags",
                                ],
                                "type": "most_fields",
                                "boost": 0.5,
                            },
                        },
                    ],
                    "minimum_should_match": 1,
                },
            },
            "size": 10,
            "min_score": 3.0,
            "sort": [
                {"_score": {"order": "desc"}},
                {"publishedAt": {"order": "desc"}},
            ],
        }

        search_response = requests.post(
            f"{base_url}/blog-posts/_search",
            json=search_body,
            headers={"Content-Type": "application/json"},
        )

        if search_response.status_code == 200:
            search_data = search_response.json()
            hits = search_data.get("hits", {}).get("hits", [])
            total = search_data.get("hits", {}).get("total", {}).get("value", 0)

            print(f"🔍 Search results for '{query}': {total} total hits")

            for i, hit in enumerate(hits[:3]):
                source = hit.get("_source", {})
                score = hit.get("_score", 0)
                title = source.get("title", "No title")
                description = source.get("description", "No description")
                tags = source.get("tags", [])

                print(f"\n{i + 1}. Score: {score:.3f}")
                print(f"   Title: {title}")
                print(f"   Description: {description[:100]}...")
                print(f"   Tags: {tags[:3]}")
        else:
            print(f"❌ Search failed: {search_response.status_code}")
            print(search_response.text)

    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Test Elasticsearch search")
    parser.add_argument("--query", default="netflix", help="Search query to test")
    parser.add_argument(
        "--url", default="http://localhost:9200", help="Elasticsearch URL"
    )

    args = parser.parse_args()

    print(f"🔍 Testing search for: '{args.query}'")
    print(f"📍 Elasticsearch URL: {args.url}")
    print("-" * 50)

    test_elasticsearch_search(args.query, args.url)


if __name__ == "__main__":
    main()
