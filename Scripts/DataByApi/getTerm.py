import requests

def get_terms():
    url = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/getTerms"
    params = {
        "offset": 1,
        "max": 100,
        "searchTerm": ""
    }
    headers = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, params=params, headers=headers)
    terms = response.json()

    # Filter: only keep codes >= 202510 (Spring 2025)
    future_terms = [term["code"] for term in terms if int(term["code"]) >= 202510]
    return future_terms

print(get_terms())