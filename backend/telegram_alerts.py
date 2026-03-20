import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID")

def get_severity_emoji(severity: int) -> str:
    mapping = {
        1: "🟢", # Low
        2: "🔵", # Minor
        3: "🟡", # Moderate
        4: "🟠", # High
        5: "🔴"  # Critical
    }
    return mapping.get(severity, "⚪")

async def send_telegram_alert(data: dict):
    """
    Sends a formatted Markdown message to the Telegram Group Chat
    notifying all 3 admin devices of a new crime report.
    """
    if not TELEGRAM_TOKEN or not ADMIN_CHAT_ID:
        print("Telegram Token or Chat ID not configured. Skipping alert.")
        return

    emoji = get_severity_emoji(data.get("severity", 1))
    
    message = (
        f"{emoji} *NEW CRIME ALERT* {emoji}\n\n"
        f"*ID:* #{data.get('id', 'N/A')}\n"
        f"*Type:* {data.get('crime_type')}\n"
        f"*District:* {data.get('district_name', 'Unassigned')}\n"
        f"*Severity Level:* {data.get('severity', 1)}/5\n"
        f"*Location:* {data.get('latitude')}, {data.get('longitude')}\n"
        f"*Details:* {data.get('description', 'No details provided.')}\n"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": ADMIN_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            response.raise_for_status()
            print(f"Telegram alert sent successfully for report #{data.get('id')}")
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")
