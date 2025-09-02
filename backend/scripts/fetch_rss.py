#!/usr/bin/env python3
"""
RSS Feed Fetcher Script
Fetches blog posts from RSS feeds and returns them as JSON
"""

import argparse
import json
import sys
import requests
from datetime import datetime
from urllib.parse import urlparse
import feedparser
from bs4 import BeautifulSoup
import re

def clean_text(text):
    """Clean HTML tags and normalize text"""
    if not text:
        return ""
    
    # Remove HTML tags
    soup = BeautifulSoup(text, 'html.parser')
    text = soup.get_text()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_tags(title, description):
    """Extract potential tags from title and description"""
    text = f"{title} {description}".lower()
    
    # Common tech keywords
    tech_keywords = [
        'javascript', 'python', 'react', 'vue', 'angular', 'nodejs', 'typescript',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'machine learning', 'ai',
        'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'api',
        'microservices', 'serverless', 'devops', 'git', 'ci/cd', 'testing',
        'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android'
    ]
    
    found_tags = []
    for keyword in tech_keywords:
        if keyword in text:
            found_tags.append(keyword)
    
    return found_tags[:5]  # Limit to 5 tags

def fetch_rss_feed(url, source):
    """Fetch and parse RSS feed"""
    try:
        # Parse the RSS feed
        feed = feedparser.parse(url)
        
        if feed.bozo:
            print(f"Error parsing RSS feed: {feed.bozo_exception}", file=sys.stderr)
            return []
        
        posts = []
        
        for entry in feed.entries:
            # Extract basic information
            title = clean_text(entry.get('title', ''))
            description = clean_text(entry.get('description', ''))
            link = entry.get('link', '')
            
            # Extract author
            author = ''
            if hasattr(entry, 'author'):
                author = entry.author
            elif hasattr(entry, 'dc_creator'):
                author = entry.dc_creator
            
            # Extract published date
            published_at = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_at = datetime(*entry.published_parsed[:6]).isoformat()
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published_at = datetime(*entry.updated_parsed[:6]).isoformat()
            
            # Extract content
            content = description
            if hasattr(entry, 'content') and entry.content:
                content = clean_text(entry.content[0].value)
            elif hasattr(entry, 'summary'):
                content = clean_text(entry.summary)
            
            # Extract tags
            tags = extract_tags(title, description)
            
            # Create post object
            post = {
                'title': title,
                'description': description,
                'content': content,
                'author': author,
                'url': link,
                'publishedAt': published_at,
                'tags': tags,
                'source': source
            }
            
            posts.append(post)
        
        return posts
        
    except Exception as e:
        print(f"Error fetching RSS feed: {str(e)}", file=sys.stderr)
        return []

def main():
    parser = argparse.ArgumentParser(description='Fetch RSS feed data')
    parser.add_argument('--url', required=True, help='RSS feed URL')
    parser.add_argument('--source', required=True, help='Source name')
    
    args = parser.parse_args()
    
    # Fetch RSS data
    posts = fetch_rss_feed(args.url, args.source)
    
    # Output as JSON
    print(json.dumps(posts, indent=2))

if __name__ == '__main__':
    main()
