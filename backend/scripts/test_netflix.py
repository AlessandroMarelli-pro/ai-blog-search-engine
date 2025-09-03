#!/usr/bin/env python3
"""
Test Netflix Semantic Search
Demonstrate enhanced semantic understanding with company-specific queries
"""

import json
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from semantic_search import SemanticSearchEngine


def create_netflix_results():
    """Create sample search results including Netflix-related content"""
    return [
        {
            "id": "1",
            "title": "How Netflix Streams Millions of Videos Instantly",
            "description": "Netflix could stream your show from Mars and you wouldn't notice. Thanks to secret optimizations and microservices architecture, Netflix delivers content globally with incredible speed.",
            "tags": [
                "netflix",
                "streaming",
                "microservices",
                "aws",
                "content delivery",
            ],
            "score": 8.5,
        },
        {
            "id": "2",
            "title": "Building Recommendation Systems Like Netflix",
            "description": "Learn how to build recommendation algorithms similar to Netflix's content discovery system using machine learning and collaborative filtering.",
            "tags": [
                "netflix",
                "recommendation",
                "machine learning",
                "ai",
                "algorithms",
            ],
            "score": 8.2,
        },
        {
            "id": "3",
            "title": "Netflix Architecture: From Monolith to Microservices",
            "description": "Explore Netflix's journey from a monolithic architecture to a distributed microservices system that handles millions of users worldwide.",
            "tags": [
                "netflix",
                "microservices",
                "architecture",
                "distributed systems",
                "scalability",
            ],
            "score": 8.0,
        },
        {
            "id": "4",
            "title": "Modern Backend Development with FastAPI and Python",
            "description": "Build high-performance APIs using FastAPI, Python's modern web framework. Learn about async programming, database integration, and deployment.",
            "tags": ["fastapi", "python", "backend", "api"],
            "score": 7.8,
        },
        {
            "id": "5",
            "title": "AI-Powered Content Recommendation Systems",
            "description": "How artificial intelligence is transforming content recommendation with deep learning models and personalized user experiences.",
            "tags": [
                "ai",
                "recommendation",
                "machine learning",
                "content",
                "personalization",
            ],
            "score": 7.9,
        },
        {
            "id": "6",
            "title": "Streaming Video Architecture Best Practices",
            "description": "Design scalable video streaming platforms with CDN integration, adaptive bitrate streaming, and global content delivery.",
            "tags": ["streaming", "video", "cdn", "architecture", "scalability"],
            "score": 7.7,
        },
        {
            "id": "7",
            "title": "React Performance Optimization for Large Applications",
            "description": "Optimize React applications for performance, including code splitting, lazy loading, and virtual scrolling techniques.",
            "tags": ["react", "performance", "frontend", "optimization"],
            "score": 7.5,
        },
        {
            "id": "8",
            "title": "Docker and Kubernetes for Microservices Deployment",
            "description": "Deploy microservices applications using Docker containers and Kubernetes orchestration for scalable, reliable systems.",
            "tags": ["docker", "kubernetes", "microservices", "deployment", "devops"],
            "score": 7.6,
        },
        {
            "id": "9",
            "title": "Building Scalable APIs with Node.js and Express",
            "description": "Create high-performance REST APIs using Node.js and Express with proper error handling, validation, and rate limiting.",
            "tags": ["node.js", "express", "api", "backend", "scalability"],
            "score": 7.4,
        },
        {
            "id": "10",
            "title": "Machine Learning for Content Personalization",
            "description": "Implement machine learning algorithms for content personalization and user behavior analysis in web applications.",
            "tags": [
                "machine learning",
                "personalization",
                "ai",
                "content",
                "algorithms",
            ],
            "score": 7.8,
        },
    ]


def main():
    # Your Netflix query
    query = "I want to build a software with trendy backend solutions and AI that is similar to Netflix"

    print("🔍 Testing Enhanced Semantic Search - Netflix Query")
    print("=" * 70)
    print(f"Query: {query}")
    print("=" * 70)

    # Initialize semantic search engine
    engine = SemanticSearchEngine(debug=True)

    # Create sample results
    results = create_netflix_results()

    print(f"\n📊 Initial Results ({len(results)} found):")
    for i, result in enumerate(results[:3]):
        print(f"{i + 1}. {result['title']} (Score: {result['score']})")

    # Process query semantically
    print(f"\n🧠 Enhanced Semantic Analysis:")
    semantic_query = engine.expand_query_semantically(query)

    print(f"Primary Intent: {semantic_query['intent']['primary_intent']}")
    print(f"Detected Companies: {semantic_query['entities']['companies']}")
    print(f"Detected Domains: {[d['domain'] for d in semantic_query['domains']]}")
    print(f"Expanded Terms: {', '.join(semantic_query['expanded_terms'][:10])}...")

    # Rank results semantically
    print(f"\n🎯 Enhanced Semantic Ranking:")
    ranked_results = engine.rank_results_semantically(results, semantic_query)

    print(f"\nTop 5 Semantically Ranked Results:")
    for i, result in enumerate(ranked_results[:5]):
        print(f"{i + 1}. {result['title']}")
        print(f"   Semantic Score: {result['semantic_score']:.3f}")
        print(f"   Domain Score: {result['domain_score']}")
        print(f"   Company Bonus: {result['company_bonus']}")
        print(f"   Expanded Bonus: {result['expanded_bonus']}")
        print(f"   Tags: {', '.join(result['tags'])}")
        print()

    # Show semantic insights
    print("💡 Enhanced Semantic Insights:")
    print(
        f"- Query Intent: {semantic_query['intent']['primary_intent']} (confidence: {semantic_query['intent']['confidence']:.2f})"
    )
    print(f"- Detected Companies: {semantic_query['entities']['companies']}")
    print(
        f"- Most Relevant Domains: {[d['domain'] for d in semantic_query['domains'][:3]]}"
    )
    print(
        f"- Query Expansion: Added {len(semantic_query['expanded_terms'])} relevant terms"
    )

    # Check if Netflix content is properly ranked
    netflix_results = [r for r in ranked_results if "netflix" in r["title"].lower()]
    print(f"\n🎯 Netflix Content Ranking:")
    for i, result in enumerate(netflix_results):
        print(f"{i + 1}. {result['title']} (Rank: {ranked_results.index(result) + 1})")

    # Save results for API testing
    output = {
        "semantic_analysis": semantic_query,
        "ranked_results": ranked_results[:10],
    }

    with open("/tmp/netflix_test_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Results saved to /tmp/netflix_test_results.json")


if __name__ == "__main__":
    main()
