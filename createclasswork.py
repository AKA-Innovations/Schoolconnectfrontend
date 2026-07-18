import requests
import random
from datetime import datetime, timedelta, timezone

# API Configuration
BASE_URL = "https://skoolconnectbackend.onrender.com"

# Teacher Login Details
USERNAME = "karan.gangwar"
PASSWORD = "Karan@123"

# Classwork Configuration
SESSION = "2026-2027"
CLASS_SECTION_ID = 46
SUBJECT_ID = 7

# Random chapter/topic options from the academic structure
CHAPTER_TOPIC_OPTIONS = [
    {"chapterId": 7, "topicId": 15},
    {"chapterId": 8, "topicId": 20}
]

# 12+ Classwork descriptions
CLASSWORK_LIST = [
    {"description": "Discussed chapter introduction and solved example problems on page 10.", "days_ago": 0},
    {"description": "Conducted interactive group activity to explain algebraic variables.", "days_ago": 1},
    {"description": "Worked through textbook exercises 1.1 questions 1 to 4 together.", "days_ago": 2},
    {"description": "Reviewed quiz results and explained common mistakes in Chapter 1.", "days_ago": 3},
    {"description": "Introduced the concept of expressions vs equations with board work.", "days_ago": 4},
    {"description": "Conducted a quick pop quiz on key definitions and terminology.", "days_ago": 5},
    {"description": "Solved word problems from section 2.1 in pairs.", "days_ago": 6},
    {"description": "Demonstrated practical applications of equations in real life.", "days_ago": 7},
    {"description": "Completed student presentation session on experimental data.", "days_ago": 8},
    {"description": "Detailed notes dictated on properties of real numbers.", "days_ago": 9},
    {"description": "Step-by-step revision of challenge problems from Chapter 2.", "days_ago": 10},
    {"description": "Practiced simplification techniques using identity rules.", "days_ago": 11},
    {"description": "Conducted revision class for the upcoming chapter test.", "days_ago": 12},
]


def authenticate(username, password):
    url = f"{BASE_URL}/auth/login"
    print(f"Authenticating user '{username}' at {url}...")

    try:
        response = requests.post(url, json={"username": username, "password": password})
        if response.status_code in [200, 201]:
            data = response.json()
            token = data.get("accessToken")
            print("Authentication successful!")
            return token

        print(f"Authentication failed (Status code: {response.status_code}): {response.text}")
        return None
    except Exception as e:
        print(f"Authentication error: {e}")
        return None


def create_classwork(token, classwork_data):
    url = f"{BASE_URL}/academic/classwork"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    short_desc = classwork_data['description']
    if len(short_desc) > 50:
        short_desc = short_desc[:47] + "..."
    print(f"Creating classwork: '{short_desc}'...")

    try:
        response = requests.post(url, json=classwork_data, headers=headers)
        if response.status_code in [200, 201]:
            print("Successfully created!")
            return True
        else:
            print(f"Failed to create (Status code: {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"Request error: {e}")
        return False


def main():
    token = authenticate(USERNAME, PASSWORD)
    if not token:
        print("Exiting due to authentication failure.")
        return

    success_count = 0
    fail_count = 0

    print(f"\nCreating {len(CLASSWORK_LIST)} classworks...\n")

    for index, cw in enumerate(CLASSWORK_LIST, start=1):
        # Pick random chapter/topic pair
        selected_pair = random.choice(CHAPTER_TOPIC_OPTIONS)

        payload = {
            "session": SESSION,
            "classSectionId": CLASS_SECTION_ID,
            "subjectId": SUBJECT_ID,
            "chapterId": selected_pair["chapterId"],
            "topicId": selected_pair["topicId"],
            "description": cw["description"]
        }

        success = create_classwork(token, payload)
        if success:
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "="*50)
    print("Summary")
    print("="*50)
    print(f"Successfully created: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Total: {len(CLASSWORK_LIST)}")
    print("="*50)


if __name__ == "__main__":
    main()
