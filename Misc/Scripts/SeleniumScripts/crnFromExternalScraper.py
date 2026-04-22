import os
import json

INPUT_DIR  = "ExternalScraper"
OUTPUT_DIR = "CRN"
KEY = "readonly (5)"

os.makedirs(OUTPUT_DIR, exist_ok=True)

for fname in os.listdir(INPUT_DIR):
    if not fname.lower().endswith(".json"):
        continue

    in_path = os.path.join(INPUT_DIR, fname)
    with open(in_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    entries = data if isinstance(data, list) else [data]

    crns = []
    for entry in entries:
        if isinstance(entry, dict) and KEY in entry:
            crns.append(entry[KEY])

    if not crns:
        print(f"⚠️  {fname}: no key '{KEY}' found; skipping.")
        continue

    if len(crns) == 1:
        out_obj = {"crn": crns[0]}
    else:
        out_obj = {"crn": crns}

    out_path = os.path.join(OUTPUT_DIR, fname)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_obj, f, indent=2)

