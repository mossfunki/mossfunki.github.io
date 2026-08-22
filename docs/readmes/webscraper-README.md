# webscraper

A stealth email scraper that harvests contact information from biopharma company websites and writes the results directly to a Google Sheet.

---

## What It Does

Starting from a curated directory of California biopharma companies (`biopharmguy.com`), the script visits each company's website, extracts email addresses from the main page and any contact/about pages it finds, filters out junk and system addresses, and appends the cleaned results — up to four emails per company — to a configured Google Sheet.

---

## Key Features

- **Directory-driven** — seeds the company list from a live biopharma directory; no manual URL list needed
- **Contact page detection** — follows internal links containing `contact` or `about` to maximize email yield
- **Junk filtering** — regex and keyword filtering strips image filenames, noreply addresses, system emails, and other non-human addresses
- **Stealth behavior** — randomized user-agent rotation, human-like delays (3–6s between requests), and randomized crawl order to reduce bot detection
- **Google Sheets output** — results written directly to a named sheet via the gspread API; no local CSV needed
- **Deduplication** — visited domains are tracked to avoid duplicate rows

---

## Tech Stack

| Library | Purpose |
|---|---|
| requests / BeautifulSoup4 | HTTP fetching and HTML parsing |
| tldextract | Clean domain extraction |
| gspread / oauth2client | Google Sheets read/write |
| re | Email extraction via regex |

---

## Setup

```bash
# Clone the repo
git clone https://github.com/mossfunki/webscraper.git
cd webscraper

# Install dependencies
pip install -r requirements.txt
```

### Google Sheets Credentials

This script authenticates with Google Sheets using a service account. You'll need to:

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com) and download the JSON key file.
2. Share your target Google Sheet with the service account email.
3. Export the JSON key as an environment variable:

```bash
export GCP_JSON_KEY='{ ...your service account JSON here... }'
```

### Configuration

Edit the top of `scraperjanuary.py` to set your sheet name and email cap:

```python
SHEET_NAME = "My BioPharm Leads"   # Must match your Google Sheet name exactly
MAX_EMAILS = 4                       # Max emails stored per company
```

### Run

```bash
python scraperjanuary.py
```

Results are appended to the configured sheet in columns: `Company`, `Website`, `Email 1` – `Email 4`.

---

## Status

Work in progress. Currently scoped to California biopharma. Planned improvements include configurable target directories, proxy support, and a broader geographic filter.
