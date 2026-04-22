
import requests
import json
import os
import time
import uuid

from getTerm import get_terms

BASE_URL = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb"

terms = get_terms()

os.makedirs("Classes", exist_ok=True)

for term in terms:
    session = requests.Session()
    headers = {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0",
    }
    print(f"\nSelecting term {term}")
    term_url = f"{BASE_URL}/term/search?mode=search&term={term}"
    resp = session.get(term_url, headers=headers)
    resp.raise_for_status()

    # Generate uniqueSessionId
    unique_session_id = f"gpt{int(time.time()*1000)}{uuid.uuid4().hex[:6]}"

    # fetch result in a batch of 250 (i think max allowed by banner)
    page_offset = 0
    page_size = 250
    all_data = []

    while True:
        params = {
            "txt_term": term,
            "startDatepicker": "",
            "endDatepicker": "",
            "uniqueSessionId": unique_session_id,
            "pageOffset": page_offset,
            "pageMaxSize": page_size,
            "sortColumn": "subjectDescription",
            "sortDirection": "asc"
        }

        print(f"Fetching classes from {page_offset} - {page_offset + page_size} for term {term}")
        url = f"{BASE_URL}/searchResults/searchResults"
        response = session.get(url, headers=headers, params=params)
        response.raise_for_status()

        json_data = response.json()
        data = json_data.get("data")

        if not isinstance(data, list):
            print(f"⚠️ No data returned for {term}, offset {page_offset}")
            print("Response:", json_data)
            break

        print(f"Data imported for {page_offset} - {page_offset + page_size}, total size: {len(data)} items.")
        if not data:
            break

        all_data.extend(data)
        if len(data) < page_size:
            break

        page_offset += page_size

    # save to file
    filename = os.path.join("Classes", f"{term}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"📦 Saved {len(all_data)} records for term {term} → {filename}")

