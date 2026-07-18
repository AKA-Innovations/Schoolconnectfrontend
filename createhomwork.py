import requests
import random
from datetime import datetime, timedelta

# API Configuration
BASE_URL = "https://skoolconnectbackend.onrender.com"

# Teacher Login Details
USERNAME = "karan.gangwar"   # Replace with actual teacher username
PASSWORD = "Karan@123"   # Replace with actual teacher password

# Homework Configuration
SESSION = "2026-2027"
CLASS_SECTION_ID = 46
SUBJECT_ID = 7

# Random chapter/topic options from the provided image
CHAPTER_TOPIC_OPTIONS = [
    {"chapterId": 7, "topicId": 15},
    {"chapterId": 8, "topicId": 20}
]

# 12+ Homework descriptions
HOMEWORK_LIST = [
    {"description": "Solve questions 1 to 5 on page 12 of your textbook.", "days_from_now": 2},
    {"description": "Solve questions 6 to 10 on page 14 of your textbook.", "days_from_now": 4},
    {"description": "Read pages 20-25 and write a short summary of the main points.", "days_from_now": 7},
    {"description": "Complete the practice worksheet on algebraic expressions.", "days_from_now": 3},
    {"description": "Solve all even-numbered problems from Exercise 2.5.", "days_from_now": 5},
    {"description": "Create a mind map showing the relationship between key concepts.", "days_from_now": 6},
    {"description": "Answer short answer questions from the end of Chapter 3.", "days_from_now": 8},
    {"description": "Prepare a one-page reflection on the topic discussed in class.", "days_from_now": 9},
    {"description": "Complete the online quiz on Chapters 1 and 2.", "days_from_now": 4},
    {"description": "Solve the problem set on applications and real-world examples.", "days_from_now": 10},
    {"description": "Write definitions and examples for all new vocabulary terms.", "days_from_now": 5},
    {"description": "Complete the investigation activity on experimental data collection.", "days_from_now": 7},
    {"description": "Solve the challenge problems marked with an asterisk in your textbook.", "days_from_now": 11},
]


def generate_title(description, index):
    """Generate a dynamic homework title from description."""
    short_desc = description.strip().split(".")[0]
    if len(short_desc) > 50:
        short_desc = short_desc[:47] + "..."
    return f"Homework {index}: {short_desc}"


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


def create_homework(token, homework_data):
    url = f"{BASE_URL}/academic/homework"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print(f"Creating homework: '{homework_data['title']}'...")
    try:
        response = requests.post(url, json=homework_data, headers=headers)
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

    print(f"\nCreating {len(HOMEWORK_LIST)} homeworks...\n")

    for index, hw in enumerate(HOMEWORK_LIST, start=1):
        due_date = (datetime.utcnow() + timedelta(days=hw["days_from_now"])).isoformat() + "Z"

        # Pick random chapter/topic pair
        selected_pair = random.choice(CHAPTER_TOPIC_OPTIONS)

        # Dynamic title from description
        title = generate_title(hw["description"], index)

        payload = {
            "session": SESSION,
            "classSectionId": CLASS_SECTION_ID,
            "subjectId": SUBJECT_ID,
            "chapterId": selected_pair["chapterId"],
            "topicId": selected_pair["topicId"],
            "title": title,
            "description": hw["description"],
            "dueDate": due_date
        }

        success = create_homework(token, payload)
        if success:
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "="*50)
    print("Summary")
    print("="*50)
    print(f"Successfully created: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Total: {len(HOMEWORK_LIST)}")
    print("="*50)


if __name__ == "__main__":
    main()
