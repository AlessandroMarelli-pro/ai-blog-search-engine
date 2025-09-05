#!/usr/bin/env python3
"""
DB Service Script
Connect to PostgreSQL DB and return the themes and tags
"""

import os
import sys
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv


def get_themes_and_tags():
    load_dotenv("../.env")
    db_url = os.getenv("DATABASE_URL")
    """
    Parse PostgreSQL URL into individual components
    """
    parsed = urlparse(db_url)

    # Extract components
    dbname = parsed.scheme
    user = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port
    database = parsed.path.lstrip("/")  # Remove leading slash
    schema = None

    # Handle query parameters (like schema)
    if parsed.query:
        params = dict(param.split("=") for param in parsed.query.split("&"))
        schema = params.get("schema")

    conn = psycopg2.connect(
        dbname=database, user=user, password=password, host=host, port=port
    )
    cursor = conn.cursor()
    cursor.execute("SELECT name, tags FROM themes")
    return cursor.fetchall()
