#!/usr/bin/env python3
"""
Semantic Search Engine
Advanced NLP-based semantic understanding for complex queries
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from typing import Any, Dict, List, Tuple

import numpy as np

# NLP Libraries
import spacy
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Installing spaCy model...")
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


class SemanticSearchEngine:
    def __init__(self, debug: bool = False):
        self.debug = debug
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Domain-specific knowledge base
        self.tech_domains = {
            "frontend": {
                "keywords": [
                    "frontend",
                    "front-end",
                    "client-side",
                    "ui",
                    "ux",
                    "user interface",
                    "web",
                    "browser",
                    "javascript",
                    "react",
                    "vue",
                    "angular",
                    "svelte",
                    "css",
                    "html",
                    "typescript",
                ],
                "concepts": [
                    "user experience",
                    "responsive design",
                    "progressive web apps",
                    "single page applications",
                    "component architecture",
                    "state management",
                    "routing",
                    "styling",
                    "accessibility",
                ],
                "technologies": [
                    "react",
                    "vue",
                    "angular",
                    "svelte",
                    "next.js",
                    "nuxt",
                    "sveltekit",
                    "typescript",
                    "javascript",
                    "css",
                    "sass",
                    "tailwind",
                    "bootstrap",
                    "webpack",
                    "vite",
                ],
            },
            "backend": {
                "keywords": [
                    "backend",
                    "back-end",
                    "server-side",
                    "api",
                    "database",
                    "server",
                    "microservices",
                    "monolith",
                    "architecture",
                    "node",
                    "python",
                    "java",
                    "go",
                    "rust",
                ],
                "concepts": [
                    "api design",
                    "database design",
                    "microservices",
                    "monolithic architecture",
                    "serverless",
                    "containerization",
                    "orchestration",
                    "scalability",
                    "security",
                    "authentication",
                    "authorization",
                ],
                "technologies": [
                    "node.js",
                    "express",
                    "fastapi",
                    "django",
                    "spring",
                    "go",
                    "rust",
                    "postgresql",
                    "mongodb",
                    "redis",
                    "docker",
                    "kubernetes",
                    "aws",
                    "azure",
                    "gcp",
                ],
            },
            "ai": {
                "keywords": [
                    "ai",
                    "artificial intelligence",
                    "machine learning",
                    "ml",
                    "deep learning",
                    "neural networks",
                    "nlp",
                    "computer vision",
                    "data science",
                    "predictive analytics",
                ],
                "concepts": [
                    "supervised learning",
                    "unsupervised learning",
                    "reinforcement learning",
                    "neural networks",
                    "natural language processing",
                    "computer vision",
                    "recommendation systems",
                    "predictive modeling",
                ],
                "technologies": [
                    "tensorflow",
                    "pytorch",
                    "scikit-learn",
                    "openai",
                    "huggingface",
                    "transformers",
                    "pandas",
                    "numpy",
                    "matplotlib",
                    "seaborn",
                    "jupyter",
                ],
            },
            "devops": {
                "keywords": [
                    "devops",
                    "ci/cd",
                    "continuous integration",
                    "continuous deployment",
                    "infrastructure",
                    "cloud",
                    "monitoring",
                    "logging",
                    "automation",
                    "deployment",
                ],
                "concepts": [
                    "continuous integration",
                    "continuous deployment",
                    "infrastructure as code",
                    "monitoring",
                    "logging",
                    "automation",
                    "deployment strategies",
                    "cloud computing",
                    "containerization",
                ],
                "technologies": [
                    "docker",
                    "kubernetes",
                    "jenkins",
                    "github actions",
                    "gitlab ci",
                    "terraform",
                    "ansible",
                    "prometheus",
                    "grafana",
                    "elk stack",
                    "aws",
                    "azure",
                    "gcp",
                ],
            },
            "architecture": {
                "keywords": [
                    "architecture",
                    "design patterns",
                    "microservices",
                    "monolith",
                    "distributed systems",
                    "scalability",
                    "performance",
                    "security",
                    "reliability",
                ],
                "concepts": [
                    "microservices architecture",
                    "monolithic architecture",
                    "event-driven architecture",
                    "domain-driven design",
                    "clean architecture",
                    "hexagonal architecture",
                    "cqs",
                    "event sourcing",
                ],
                "technologies": [
                    "apache kafka",
                    "rabbitmq",
                    "redis",
                    "elasticsearch",
                    "postgresql",
                    "mongodb",
                    "docker",
                    "kubernetes",
                    "istio",
                    "consul",
                ],
            },
        }

        # Query intent patterns
        self.intent_patterns = {
            "learning": r"\b(learn|study|understand|get started|beginner|tutorial|guide|how to)\b",
            "building": r"\b(build|create|develop|implement|make|construct|design)\b",
            "updates": r"\b(latest|new|recent|up-to-date|current|trending|emerging|modern)\b",
            "comparison": r"\b(compare|vs|versus|difference|better|best|choose|select)\b",
            "problem_solving": r"\b(solve|fix|issue|problem|challenge|troubleshoot|debug)\b",
            "evaluation": r"\b(evaluate|assess|review|analyze|examine|consider)\b",
        }

        # Common company names and applications
        self.company_contexts = {
            "netflix": {
                "keywords": [
                    "streaming",
                    "video",
                    "media",
                    "entertainment",
                    "recommendation",
                    "content",
                ],
                "tech_concepts": [
                    "microservices",
                    "distributed systems",
                    "recommendation algorithms",
                    "content delivery",
                    "scalability",
                ],
                "related_tech": [
                    "react",
                    "node.js",
                    "python",
                    "machine learning",
                    "aws",
                    "docker",
                    "kubernetes",
                ],
            },
            "spotify": {
                "keywords": [
                    "music",
                    "audio",
                    "streaming",
                    "playlist",
                    "recommendation",
                ],
                "tech_concepts": [
                    "audio processing",
                    "recommendation systems",
                    "real-time streaming",
                    "personalization",
                ],
                "related_tech": [
                    "python",
                    "machine learning",
                    "react",
                    "node.js",
                    "aws",
                ],
            },
            "uber": {
                "keywords": [
                    "ride-sharing",
                    "transportation",
                    "mobility",
                    "matching",
                    "location",
                ],
                "tech_concepts": [
                    "real-time matching",
                    "geolocation",
                    "distributed systems",
                    "microservices",
                ],
                "related_tech": ["python", "node.js", "postgresql", "redis", "aws"],
            },
            "airbnb": {
                "keywords": [
                    "accommodation",
                    "booking",
                    "travel",
                    "matching",
                    "hosting",
                ],
                "tech_concepts": [
                    "booking systems",
                    "matching algorithms",
                    "payment processing",
                    "review systems",
                ],
                "related_tech": [
                    "react",
                    "node.js",
                    "postgresql",
                    "aws",
                    "machine learning",
                ],
            },
            "instagram": {
                "keywords": ["social media", "photo", "video", "sharing", "feed"],
                "tech_concepts": [
                    "content feed",
                    "image processing",
                    "social networks",
                    "real-time updates",
                ],
                "related_tech": ["python", "react", "postgresql", "redis", "aws"],
            },
        }

        # Non-tech domains for broader context
        self.non_tech_domains = {
            "gardening": {
                "keywords": [
                    "gardening",
                    "plants",
                    "garden",
                    "horticulture",
                    "agriculture",
                    "farming",
                ],
                "tech_concepts": [
                    "iot sensors",
                    "automated watering",
                    "climate control",
                    "data collection",
                ],
                "related_tech": [
                    "python",
                    "iot",
                    "sensors",
                    "data analysis",
                    "mobile apps",
                ],
            },
            "healthcare": {
                "keywords": [
                    "healthcare",
                    "medical",
                    "health",
                    "patient",
                    "hospital",
                    "clinic",
                ],
                "tech_concepts": [
                    "electronic health records",
                    "telemedicine",
                    "patient monitoring",
                    "diagnostic systems",
                ],
                "related_tech": [
                    "python",
                    "machine learning",
                    "mobile apps",
                    "databases",
                    "apis",
                ],
            },
            "education": {
                "keywords": [
                    "education",
                    "learning",
                    "school",
                    "university",
                    "course",
                    "training",
                ],
                "tech_concepts": [
                    "learning management systems",
                    "online education",
                    "adaptive learning",
                    "assessment tools",
                ],
                "related_tech": ["react", "node.js", "python", "databases", "apis"],
            },
            "finance": {
                "keywords": [
                    "finance",
                    "banking",
                    "payment",
                    "investment",
                    "trading",
                    "fintech",
                ],
                "tech_concepts": [
                    "payment processing",
                    "risk assessment",
                    "algorithmic trading",
                    "blockchain",
                ],
                "related_tech": ["python", "java", "databases", "apis", "blockchain"],
            },
            "ecommerce": {
                "keywords": [
                    "ecommerce",
                    "shopping",
                    "retail",
                    "store",
                    "marketplace",
                    "sales",
                ],
                "tech_concepts": [
                    "inventory management",
                    "payment processing",
                    "recommendation systems",
                    "order management",
                ],
                "related_tech": [
                    "react",
                    "node.js",
                    "python",
                    "databases",
                    "payment apis",
                ],
            },
        }

    def log_debug(self, *args):
        if self.debug:
            print("[semantic_search][DEBUG]", *args, file=sys.stderr, flush=True)

    def extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract named entities and context from query"""
        doc = nlp(query.lower())

        entities = {
            "companies": [],
            "technologies": [],
            "concepts": [],
            "domains": [],
            "other_entities": [],
        }

        # Extract named entities
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT"]:
                entities["companies"].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                entities["other_entities"].append(ent.text)

        # Extract potential company names (capitalized words)
        words = query.split()
        for word in words:
            if word[0].isupper() and len(word) > 2:
                # Check if it's a known company
                if word.lower() in self.company_contexts:
                    entities["companies"].append(word)
                elif word.lower() not in [w.lower() for w in entities["companies"]]:
                    entities["other_entities"].append(word)

        # Extract technologies and concepts from the query
        query_lower = query.lower()
        for domain, info in self.tech_domains.items():
            for tech in info["technologies"]:
                if tech in query_lower:
                    entities["technologies"].append(tech)
            for concept in info["concepts"]:
                if concept in query_lower:
                    entities["concepts"].append(concept)

        self.log_debug(f"Extracted entities: {entities}")
        return entities

    def extract_intent(self, query: str) -> Dict[str, Any]:
        """Extract user intent from query"""
        doc = nlp(query.lower())

        intent = {
            "primary_intent": "information",
            "secondary_intents": [],
            "confidence": 0.0,
        }

        # Extract intents based on patterns
        for intent_name, pattern in self.intent_patterns.items():
            if re.search(pattern, query.lower()):
                intent["secondary_intents"].append(intent_name)

        # Determine primary intent
        if "building" in intent["secondary_intents"]:
            intent["primary_intent"] = "building"
        elif "learning" in intent["secondary_intents"]:
            intent["primary_intent"] = "learning"
        elif "updates" in intent["secondary_intents"]:
            intent["primary_intent"] = "updates"

        intent["confidence"] = len(intent["secondary_intents"]) / len(
            self.intent_patterns
        )

        self.log_debug(f"Extracted intent: {intent}")
        return intent

    def extract_domains(self, query: str) -> List[Dict[str, Any]]:
        """Extract relevant technology domains and context from query"""
        query_lower = query.lower()
        relevant_domains = []

        # Extract entities for context
        entities = self.extract_entities(query)

        # Check for company contexts first
        for company, context in self.company_contexts.items():
            if company in query_lower:
                relevant_domains.append(
                    {
                        "domain": f"company_{company}",
                        "relevance_score": 3,  # High priority for company context
                        "keyword_matches": 1,
                        "concept_matches": 0,
                        "tech_matches": 0,
                        "context": context,
                    }
                )

        # Check non-tech domains
        for domain, info in self.non_tech_domains.items():
            keyword_matches = sum(
                1 for keyword in info["keywords"] if keyword in query_lower
            )
            concept_matches = sum(
                1 for concept in info["tech_concepts"] if concept in query_lower
            )
            tech_matches = sum(
                1 for tech in info["related_tech"] if tech in query_lower
            )

            total_matches = keyword_matches + concept_matches + tech_matches

            if total_matches > 0:
                relevant_domains.append(
                    {
                        "domain": f"non_tech_{domain}",
                        "relevance_score": total_matches,
                        "keyword_matches": keyword_matches,
                        "concept_matches": concept_matches,
                        "tech_matches": tech_matches,
                        "context": info,
                    }
                )

        # Check tech domains
        for domain, info in self.tech_domains.items():
            # Check keywords
            keyword_matches = sum(
                1 for keyword in info["keywords"] if keyword in query_lower
            )
            # Check concepts
            concept_matches = sum(
                1 for concept in info["concepts"] if concept in query_lower
            )
            # Check technologies
            tech_matches = sum(
                1 for tech in info["technologies"] if tech in query_lower
            )

            total_matches = keyword_matches + concept_matches + tech_matches

            if total_matches > 0:
                relevant_domains.append(
                    {
                        "domain": domain,
                        "relevance_score": total_matches,
                        "keyword_matches": keyword_matches,
                        "concept_matches": concept_matches,
                        "tech_matches": tech_matches,
                    }
                )

        # Sort by relevance
        relevant_domains.sort(key=lambda x: x["relevance_score"], reverse=True)

        self.log_debug(f"Extracted domains: {relevant_domains}")
        return relevant_domains

    def expand_query_semantically(self, query: str) -> Dict[str, Any]:
        """Expand query with semantic understanding"""
        intent = self.extract_intent(query)
        domains = self.extract_domains(query)
        entities = self.extract_entities(query)

        # Build expanded query components
        expanded_terms = []

        # Add company-specific terms if found
        for domain_info in domains:
            if domain_info["domain"].startswith("company_"):
                company = domain_info["domain"].replace("company_", "")
                if company in self.company_contexts:
                    context = self.company_contexts[company]
                    expanded_terms.extend(context["keywords"])
                    expanded_terms.extend(context["tech_concepts"])
                    expanded_terms.extend(context["related_tech"])
                    # Add the company name itself
                    expanded_terms.append(company)

        # Add non-tech domain terms
        for domain_info in domains:
            if domain_info["domain"].startswith("non_tech_"):
                domain = domain_info["domain"].replace("non_tech_", "")
                if domain in self.non_tech_domains:
                    context = self.non_tech_domains[domain]
                    expanded_terms.extend(context["keywords"])
                    expanded_terms.extend(context["tech_concepts"])
                    expanded_terms.extend(context["related_tech"])

        # Add domain-specific terms
        for domain_info in domains[:3]:  # Top 3 most relevant domains
            if not domain_info["domain"].startswith("company_") and not domain_info[
                "domain"
            ].startswith("non_tech_"):
                domain = domain_info["domain"]
                domain_data = self.tech_domains[domain]

                # Add high-priority terms based on intent
                if intent["primary_intent"] == "building":
                    expanded_terms.extend(domain_data["technologies"][:5])
                    expanded_terms.extend(domain_data["concepts"][:3])
                elif intent["primary_intent"] == "learning":
                    expanded_terms.extend(domain_data["concepts"][:5])
                    expanded_terms.extend(domain_data["technologies"][:3])
                elif intent["primary_intent"] == "updates":
                    expanded_terms.extend(domain_data["technologies"][:3])
                    expanded_terms.extend(["latest", "new", "recent", "trending"])
                else:
                    expanded_terms.extend(domain_data["keywords"][:3])
                    expanded_terms.extend(domain_data["concepts"][:2])

        # Add intent-specific terms
        if "building" in intent["secondary_intents"]:
            expanded_terms.extend(
                ["implementation", "development", "architecture", "design"]
            )
        if "learning" in intent["secondary_intents"]:
            expanded_terms.extend(
                ["tutorial", "guide", "learning", "education", "best practices"]
            )
        if "updates" in intent["secondary_intents"]:
            expanded_terms.extend(
                ["latest", "new", "recent", "trending", "emerging", "modern"]
            )

        # Add extracted entities
        expanded_terms.extend(entities["companies"])
        expanded_terms.extend(entities["technologies"])
        expanded_terms.extend(entities["concepts"])

        # Remove duplicates and limit
        expanded_terms = list(set(expanded_terms))[:25]

        # Create semantic query
        semantic_query = {
            "original_query": query,
            "intent": intent,
            "domains": domains,
            "entities": entities,
            "expanded_terms": expanded_terms,
            "semantic_query": " ".join(expanded_terms),
            "domain_weights": {d["domain"]: d["relevance_score"] for d in domains},
        }

        self.log_debug(f"Semantic query: {semantic_query}")
        return semantic_query

    def rank_results_semantically(
        self, results: List[Dict], semantic_query: Dict
    ) -> List[Dict]:
        """Rank results based on semantic relevance"""
        if not results:
            return results

        # Get embeddings for results
        result_texts = [
            f"{r.get('title', '')} {r.get('description', '')} {' '.join(r.get('tags', []))} {' '.join(r.get('themes', []))}"
            for r in results
        ]
        result_embeddings = self.model.encode(result_texts, convert_to_tensor=True)

        # Get embedding for semantic query
        query_embedding = self.model.encode(
            semantic_query["semantic_query"], convert_to_tensor=True
        )

        # Calculate semantic similarity
        similarities = util.pytorch_cos_sim(query_embedding, result_embeddings)[0]

        # Calculate domain relevance
        for i, result in enumerate(results):
            result_text = result_texts[i].lower()

            # Domain relevance score
            domain_score = 0
            company_bonus = 0

            # Check for company-specific content
            entities = semantic_query.get("entities", {})
            for company in entities.get("companies", []):
                if company.lower() in result_text:
                    company_bonus += 5  # High bonus for exact company match
                    # Add bonus for company-related terms
                    if company.lower() in self.company_contexts:
                        context = self.company_contexts[company.lower()]
                        for keyword in context["keywords"]:
                            if keyword in result_text:
                                company_bonus += 1
                        for tech in context["related_tech"]:
                            if tech in result_text:
                                company_bonus += 1

            # Check domain relevance
            for domain, weight in semantic_query["domain_weights"].items():
                if domain.startswith("company_"):
                    # Company domain - check for company-specific terms
                    company = domain.replace("company_", "")
                    if company in result_text:
                        domain_score += weight * 2  # Double weight for company matches
                elif domain.startswith("non_tech_"):
                    # Non-tech domain - check for domain-specific terms
                    non_tech_domain = domain.replace("non_tech_", "")
                    if non_tech_domain in self.non_tech_domains:
                        context = self.non_tech_domains[non_tech_domain]
                        for keyword in context["keywords"]:
                            if keyword in result_text:
                                domain_score += weight
                        for concept in context["tech_concepts"]:
                            if concept in result_text:
                                domain_score += weight
                        for tech in context["related_tech"]:
                            if tech in result_text:
                                domain_score += weight
                else:
                    # Tech domain - check for tech terms
                    if domain in self.tech_domains:
                        domain_keywords = self.tech_domains[domain]["keywords"]
                        domain_concepts = self.tech_domains[domain]["concepts"]
                        domain_techs = self.tech_domains[domain]["technologies"]

                        matches = sum(
                            1
                            for term in domain_keywords + domain_concepts + domain_techs
                            if term in result_text
                        )
                        domain_score += matches * weight

            # Check for expanded terms in the result
            expanded_terms = semantic_query.get("expanded_terms", [])
            expanded_matches = sum(
                1 for term in expanded_terms if term.lower() in result_text
            )
            expanded_bonus = expanded_matches * 0.5

            # Combine semantic similarity with domain relevance
            semantic_score = float(similarities[i])
            combined_score = (
                semantic_score * 0.6
                + (min(domain_score / 10, 1.0) * 0.3)
                + (min(company_bonus / 10, 1.0) * 0.1)
                + (min(expanded_bonus / 10, 1.0) * 0.1)
                + result.get("score", 0) * 0.5
            )

            result["semantic_score"] = combined_score
            result["domain_score"] = domain_score
            result["company_bonus"] = company_bonus
            result["expanded_bonus"] = expanded_bonus
            result["original_score"] = result.get("score", 0)
            result["score"] = combined_score

        # Sort by combined score
        results.sort(key=lambda x: x["score"], reverse=True)

        return results


def main():
    parser = argparse.ArgumentParser(description="Semantic search engine")
    parser.add_argument("--query", required=True, help="Natural language query")
    parser.add_argument("--results", help="JSON file with search results")
    parser.add_argument(
        "--analysis-only",
        action="store_true",
        help="Only perform semantic analysis, don't rank results",
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")

    args = parser.parse_args()
    debug = args.debug or os.environ.get("PYTHON_DEBUG") == "1"

    # Initialize semantic search engine
    engine = SemanticSearchEngine(debug=debug)

    # Process query
    semantic_query = engine.expand_query_semantically(args.query)

    # If analysis-only mode, just return the semantic analysis
    if args.analysis_only:
        output = {"semantic_analysis": semantic_query}
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return

    # Load results if provided
    if not args.results:
        print("Error: --results file is required when not in analysis-only mode")
        return

    try:
        with open(args.results, "r") as f:
            results = json.load(f)
    except Exception as e:
        print(f"Error loading results: {e}")
        return

    # Rank results semantically
    ranked_results = engine.rank_results_semantically(results, semantic_query)

    # Output semantic analysis and ranked results
    output = {
        "semantic_analysis": semantic_query,
        "ranked_results": ranked_results[:25],  # Top 10 results
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
