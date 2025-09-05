
curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevTo",
    "url": "https://dev.to/feed"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JVNS",
    "url": "https://jvns.ca/atom.xml"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Simon Willison",
    "url": "https://simonwillison.net/atom/everything/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pragmatic Engineer",
    "url": "https://blog.pragmaticengineer.com/rss/"
  }'
curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (DEV)",
    "url": "https://hackernoon.com/tagged/dev/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (Programming)",
    "url": "https://hackernoon.com/tagged/programming/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (Crypto)",
    "url": "https://hackernoon.com/tagged/crypto/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (Technology)",
    "url": "https://hackernoon.com/tagged/tech-stories/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (AI)",
    "url": "https://hackernoon.com/tagged/ai/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker Noon (Business)",
    "url": "https://hackernoon.com/tagged/business/feed/"
  }'

curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Feature Shoot",
    "url": "https://feeds.feedburner.com/FeatureShoot"
  }'