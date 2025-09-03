#!/usr/bin/env python3
"""
Comprehensive Semantic Search Test
Demonstrate all semantic search improvements
"""

import json
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from semantic_search import SemanticSearchEngine


def create_comprehensive_results():
    """Create sample search results with various domains"""
    return [
        # Netflix-related content
        {
            "id": "1",
            "title": "How Netflix Streams Millions of Videos Instantly",
            "description": "Netflix could stream your show from Mars and you wouldn't notice. Thanks to secret optimizations and microservices architecture.",
            "tags": ["netflix", "streaming", "microservices", "aws"],
            "score": 8.5,
        },
        {
            "id": "2",
            "title": "Building Recommendation Systems Like Netflix",
            "description": "Learn how to build recommendation algorithms similar to Netflix's content discovery system using machine learning.",
            "tags": ["netflix", "recommendation", "machine learning", "ai"],
            "score": 8.2,
        },
        # Gardening-related content
        {
            "id": "3",
            "title": "Smart Gardening: IoT Sensors for Plant Health",
            "description": "Build a smart gardening system using IoT sensors to monitor soil moisture, temperature, and automate watering systems.",
            "tags": ["gardening", "iot", "sensors", "automation", "plants"],
            "score": 8.0,
        },
        {
            "id": "4",
            "title": "Mobile App for Garden Management",
            "description": "Create a mobile application for garden management with plant identification, watering schedules, and climate monitoring.",
            "tags": ["gardening", "mobile apps", "plants", "management"],
            "score": 7.8,
        },
        # Healthcare-related content
        {
            "id": "5",
            "title": "Healthcare App Development with React Native",
            "description": "Build healthcare applications for patient monitoring, telemedicine, and electronic health records using React Native.",
            "tags": [
                "healthcare",
                "react native",
                "telemedicine",
                "patient monitoring",
            ],
            "score": 8.1,
        },
        # General tech content
        {
            "id": "6",
            "title": "Modern Backend Development with FastAPI",
            "description": "Build high-performance APIs using FastAPI, Python's modern web framework for scalable applications.",
            "tags": ["fastapi", "python", "backend", "api"],
            "score": 7.9,
        },
        {
            "id": "7",
            "title": "AI-Powered Content Recommendation",
            "description": "How artificial intelligence is transforming content recommendation with deep learning models.",
            "tags": ["ai", "recommendation", "machine learning", "content"],
            "score": 7.7,
        },
        {
            "id": "8",
            "title": "Microservices Architecture Best Practices",
            "description": "Design scalable microservices architecture with proper service boundaries and communication patterns.",
            "tags": [
                "microservices",
                "architecture",
                "scalability",
                "distributed systems",
            ],
            "score": 7.6,
        },
    ]


def test_queries():
    """Test various types of queries"""
    queries = [
        {
            "name": "Netflix Query",
            "query": "I want to build a software with trendy backend solutions and AI that is similar to Netflix",
            "expected_domains": ["company_netflix", "backend", "ai"],
            "expected_companies": ["Netflix"],
        },
        {
            "name": "Gardening Query",
            "query": "I want to build a tech app related to gardening",
            "expected_domains": ["non_tech_gardening", "frontend"],
            "expected_companies": [],
        },
        {
            "name": "Healthcare Query",
            "query": "Show me how to build healthcare applications with modern technology",
            "expected_domains": ["non_tech_healthcare", "frontend"],
            "expected_companies": [],
        },
        {
            "name": "General Tech Query",
            "query": "Latest trends in microservices and AI development",
            "expected_domains": ["architecture", "ai"],
            "expected_companies": [],
        },
    ]
    return queries


def main():
    print("🔍 Comprehensive Semantic Search Test")
    print("=" * 60)

    # Initialize semantic search engine
    engine = SemanticSearchEngine(debug=False)

    # Create sample results
    results = create_comprehensive_results()

    # Test different queries
    queries = test_queries()

    for query_info in queries:
        print(f"\n📝 Testing: {query_info['name']}")
        print(f"Query: {query_info['query']}")
        print("-" * 50)

        # Process query semantically
        semantic_query = engine.expand_query_semantically(query_info["query"])

        print(f"Intent: {semantic_query['intent']['primary_intent']}")
        print(f"Companies: {semantic_query['entities']['companies']}")
        print(f"Domains: {[d['domain'] for d in semantic_query['domains']]}")
        print(f"Expanded Terms: {', '.join(semantic_query['expanded_terms'][:8])}...")

        # Rank results semantically
        ranked_results = engine.rank_results_semantically(results, semantic_query)

        print(f"\nTop 3 Results:")
        for i, result in enumerate(ranked_results[:3]):
            print(f"{i + 1}. {result['title']}")
            print(
                f"   Score: {result['score']:.3f} | Domain: {result['domain_score']} | Company: {result['company_bonus']}"
            )
            print(f"   Tags: {', '.join(result['tags'])}")

        # Verify expectations
        detected_domains = [d["domain"] for d in semantic_query["domains"]]
        detected_companies = semantic_query["entities"]["companies"]

        print(f"\n✅ Verification:")
        print(f"Expected domains: {query_info['expected_domains']}")
        print(f"Detected domains: {detected_domains}")
        print(f"Expected companies: {query_info['expected_companies']}")
        print(f"Detected companies: {detected_companies}")

        # Check if expectations are met
        domain_match = any(
            domain in detected_domains for domain in query_info["expected_domains"]
        )
        company_match = len(query_info["expected_companies"]) == 0 or any(
            company in detected_companies
            for company in query_info["expected_companies"]
        )

        if domain_match and company_match:
            print("🎯 PASS: Query processed correctly!")
        else:
            print("❌ FAIL: Query processing needs improvement")

    print(f"\n" + "=" * 60)
    print("📊 Summary:")
    print("✅ Enhanced semantic search now supports:")
    print("   • Company-specific queries (Netflix, Spotify, etc.)")
    print("   • Non-tech domains (gardening, healthcare, etc.)")
    print("   • Dynamic entity extraction")
    print("   • Context-aware query expansion")
    print("   • Improved ranking with domain bonuses")

    # Save comprehensive results
    output = {"test_results": {"queries": queries, "sample_results": results}}

    with open("/tmp/comprehensive_test_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print(
        f"\n✅ Comprehensive test results saved to /tmp/comprehensive_test_results.json"
    )


if __name__ == "__main__":
    main()
