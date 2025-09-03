#!/usr/bin/env python3
"""
Test Semantic Search
Demonstrate semantic understanding with complex queries
"""

import json
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from semantic_search import SemanticSearchEngine


def create_sample_results():
    """Create sample search results for testing"""
    return [
        {
            "id": "1",
            "title": "Building Full-Stack Applications with React and Node.js",
            "description": "Learn how to create modern web applications using React for frontend and Node.js with Express for backend. This comprehensive guide covers everything from setup to deployment.",
            "tags": ["react", "node.js", "express", "frontend", "backend", "fullstack"],
            "score": 8.5,
        },
        {
            "id": "2",
            "title": "Latest Trends in Frontend Development: 2024 Edition",
            "description": "Discover the newest technologies and frameworks in frontend development including React 18, Vue 3, and modern CSS techniques.",
            "tags": ["frontend", "react", "vue", "trending", "latest"],
            "score": 7.8,
        },
        {
            "id": "3",
            "title": "Microservices Architecture: Best Practices for Scalable Applications",
            "description": "Explore microservices architecture patterns and learn how to design scalable backend systems with proper service boundaries and communication.",
            "tags": ["microservices", "architecture", "backend", "scalability"],
            "score": 8.2,
        },
        {
            "id": "4",
            "title": "AI-Powered Development Tools: Revolutionizing Software Engineering",
            "description": "How artificial intelligence is transforming software development with tools like GitHub Copilot, automated testing, and intelligent code review.",
            "tags": ["ai", "development", "tools", "automation"],
            "score": 7.9,
        },
        {
            "id": "5",
            "title": "Modern Backend Development with FastAPI and Python",
            "description": "Build high-performance APIs using FastAPI, Python's modern web framework. Learn about async programming, database integration, and deployment.",
            "tags": ["fastapi", "python", "backend", "api"],
            "score": 8.0,
        },
        {
            "id": "6",
            "title": "Frontend State Management: Redux vs Zustand vs Context API",
            "description": "Compare different state management solutions for React applications and learn when to use each approach.",
            "tags": ["frontend", "react", "state management", "redux"],
            "score": 7.5,
        },
        {
            "id": "7",
            "title": "DevOps and CI/CD: Automating Your Development Workflow",
            "description": "Set up continuous integration and deployment pipelines using GitHub Actions, Docker, and Kubernetes for modern applications.",
            "tags": ["devops", "ci/cd", "docker", "kubernetes"],
            "score": 8.1,
        },
        {
            "id": "8",
            "title": "Database Design Patterns for Scalable Applications",
            "description": "Learn about database design patterns, normalization, and optimization techniques for building robust backend systems.",
            "tags": ["database", "design patterns", "backend", "scalability"],
            "score": 7.7,
        },
        {
            "id": "9",
            "title": "Progressive Web Apps: The Future of Web Development",
            "description": "Build progressive web applications that work offline, load instantly, and provide native app-like experiences.",
            "tags": ["pwa", "frontend", "progressive", "web apps"],
            "score": 7.6,
        },
        {
            "id": "10",
            "title": "Machine Learning Integration in Web Applications",
            "description": "Integrate machine learning models into your web applications using TensorFlow.js and Python backend services.",
            "tags": ["machine learning", "ai", "frontend", "tensorflow"],
            "score": 8.3,
        },
    ]


def main():
    # Your complex query
    query = "I want to build a software that handles frontend and backend solutions. Give all the last blog posts that will help me be up-to-date concerning theses subjects, the new technologies, architectures solutions and AI tools"

    print("🔍 Testing Semantic Search Engine")
    print("=" * 60)
    print(f"Query: {query}")
    print("=" * 60)

    # Initialize semantic search engine
    engine = SemanticSearchEngine(debug=True)

    # Create sample results
    results = create_sample_results()

    print(f"\n📊 Initial Results ({len(results)} found):")
    for i, result in enumerate(results[:3]):
        print(f"{i + 1}. {result['title']} (Score: {result['score']})")

    # Process query semantically
    print(f"\n🧠 Semantic Analysis:")
    semantic_query = engine.expand_query_semantically(query)

    print(f"Primary Intent: {semantic_query['intent']['primary_intent']}")
    print(
        f"Secondary Intents: {', '.join(semantic_query['intent']['secondary_intents'])}"
    )
    print(f"Detected Domains: {[d['domain'] for d in semantic_query['domains']]}")
    print(f"Expanded Terms: {', '.join(semantic_query['expanded_terms'][:10])}...")

    # Rank results semantically
    print(f"\n🎯 Semantic Ranking:")
    ranked_results = engine.rank_results_semantically(results, semantic_query)

    print(f"\nTop 5 Semantically Ranked Results:")
    for i, result in enumerate(ranked_results[:5]):
        print(f"{i + 1}. {result['title']}")
        print(f"   Semantic Score: {result['semantic_score']:.3f}")
        print(f"   Domain Score: {result['domain_score']}")
        print(f"   Tags: {', '.join(result['tags'])}")
        print()

    # Show semantic insights
    print("💡 Semantic Insights:")
    print(
        f"- Query Intent: {semantic_query['intent']['primary_intent']} (confidence: {semantic_query['intent']['confidence']:.2f})"
    )
    print(
        f"- Most Relevant Domains: {[d['domain'] for d in semantic_query['domains'][:3]]}"
    )
    print(
        f"- Query Expansion: Added {len(semantic_query['expanded_terms'])} relevant terms"
    )

    # Save results for API testing
    output = {
        "semantic_analysis": semantic_query,
        "ranked_results": ranked_results[:10],
    }

    with open("/tmp/semantic_test_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Results saved to /tmp/semantic_test_results.json")


if __name__ == "__main__":
    main()
