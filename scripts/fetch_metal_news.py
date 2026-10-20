#!/usr/bin/env python3
"""
Metal News Aggregator for Persevera Official Website.
Fetches top rock & heavy metal news from major national & international portals:
- Roadie Crew (Brazil)
- Wikimetal (Brazil)
- Road to Metal (Brazil)
- Blabbermouth.net (Global)
- Loudwire (Global)
- Metal Injection (Global)

Saves sanitized, deduplicated news into assets/data/metal-news.json.
Runs automatically every 3 days via GitHub Actions (.github/workflows/update-metal-news.yml).
"""

import urllib.request
import xml.etree.ElementTree as ET
import json
import ssl
import re
from datetime import datetime, timezone
import html
import os

FEEDS = [
    {
        "source": "Roadie Crew",
        "lang": "pt",
        "region": "BR",
        "url": "https://roadiecrew.com/feed/",
        "color": "#e50914"
    },
    {
        "source": "Wikimetal",
        "lang": "pt",
        "region": "BR",
        "url": "https://www.wikimetal.com.br/feed/",
        "color": "#00d4ff"
    },
    {
        "source": "Road to Metal",
        "lang": "pt",
        "region": "BR",
        "url": "https://www.roadtometal.com.br/feeds/posts/default?alt=rss",
        "color": "#f59e0b"
    },
    {
        "source": "Blabbermouth",
        "lang": "en",
        "region": "GLOBAL",
        "url": "https://blabbermouth.net/feed",
        "color": "#a855f7"
    },
    {
        "source": "Loudwire",
        "lang": "en",
        "region": "GLOBAL",
        "url": "https://loudwire.com/feed/",
        "color": "#10b981"
    },
    {
        "source": "Metal Injection",
        "lang": "en",
        "region": "GLOBAL",
        "url": "https://metalinjection.net/feed",
        "color": "#ec4899"
    }
]

def clean_text(raw):
    if not raw:
        return ""
    text = html.unescape(raw)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_url(url):
    if not url:
        return ""
    # Strip tracking queries
    return re.sub(r'\?(utm_[^&]+(&|$)|ref=[^&]+(&|$)).*', '', url).rstrip('?')

def fetch_feed(feed_info):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }

    results = []
    try:
        req = urllib.request.Request(feed_info["url"], headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            content = resp.read()
            root = ET.fromstring(content)
            items = root.findall('.//item')

            for item in items[:8]:  # Take top 8 per source
                title_el = item.find('title')
                link_el = item.find('link')
                date_el = item.find('pubDate')

                if title_el is None or link_el is None:
                    continue

                title = clean_text(title_el.text)
                link = clean_url(link_el.text.strip())

                if not title or not link or len(title) < 8:
                    continue

                pub_date = date_el.text.strip() if date_el is not None and date_el.text else ""

                results.append({
                    "source": feed_info["source"],
                    "lang": feed_info["lang"],
                    "region": feed_info["region"],
                    "color": feed_info["color"],
                    "title": title,
                    "link": link,
                    "pubDate": pub_date
                })
        print(f"[{feed_info['source']}] Fetched {len(results)} items successfully.")
    except Exception as e:
        print(f"[{feed_info['source']}] Error fetching feed: {e}")

    return results

def main():
    all_news = []
    for f in FEEDS:
        all_news.extend(fetch_feed(f))

    # Deduplicate by normalized title
    seen_titles = set()
    deduped = []
    for item in all_news:
        norm = re.sub(r'[^a-zA-Z0-9]', '', item["title"].lower())[:40]
        if norm and norm not in seen_titles:
            seen_titles.add(norm)
            deduped.append(item)

    # Interleave sources nicely so the ticker shows a varied mix of PT and EN sources
    # Group by source
    by_source = {}
    for item in deduped:
        by_source.setdefault(item["source"], []).append(item)

    interleaved = []
    max_len = max((len(v) for v in by_source.values()), default=0)
    for i in range(max_len):
        for s in by_source:
            if i < len(by_source[s]):
                interleaved.append(by_source[s][i])

    # Limit to top 24 news items
    final_news = interleaved[:24]

    output_data = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "update_frequency_days": 3,
        "total": len(final_news),
        "sources": [f["source"] for f in FEEDS],
        "news": final_news
    }

    # Ensure output dir exists
    out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "metal-news.json")

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully saved {len(final_news)} metal news items to {out_file}!")

if __name__ == "__main__":
    main()
