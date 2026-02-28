import json
import os
import requests

# Log responses for debugging / learning the API structure
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "last_response.json")


def log_response(name: str, response: requests.Response, parsed=None):
    """Log API response for later inspection."""
    entry = {
        "request": name,
        "status_code": response.status_code,
        "url": response.url,
        "headers": dict(response.headers),
        "text_preview": response.text[:2000] if response.text else None,
        "text_length": len(response.text) if response.text else 0,
    }
    if parsed is not None:
        entry["parsed"] = parsed
    try:
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(entry, f, indent=2, ensure_ascii=False)
    except OSError:
        pass


try:
    from config import (
        WELCOME_URL,
        LOGIN_URL,
        LOGIN_DATA,
        METER_DATA,
        METER_URL
    )

except ImportError:
    print("WARNING: no config.py found. Please RTFM!")
    exit()

regex = r"var url = '([^']+)'"

if __name__ == "__main__":
    # Create request session
    session = requests.Session()

    response = session.get(WELCOME_URL)

    # Login
    response = session.post(
        LOGIN_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=LOGIN_DATA,
    )

    # Meter
    response = session.post(
        METER_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=METER_DATA,
    )

    data = json.loads(response.text)
    log_response("meter", response, parsed=data)

    try:
        actions = data.get("actions") or []
        first = actions[0] if actions else {}
        return_value = first.get("returnValue") if first else {}
        meter = return_value.get("data") if return_value else None
    except (IndexError, TypeError, KeyError):
        meter = None

    if meter is None:
        meter = {
            "potenciaActual": 0,
            "percent": 0,
            "totalizador": 0,
        }

    print(json.dumps(meter))