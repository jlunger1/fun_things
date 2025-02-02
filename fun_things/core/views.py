import random
from django.http import JsonResponse
from fun_things.core.models import NPSThingToDo, CustomUser

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials
import os

# get the absolute path of the current file
dir_path = os.path.dirname(os.path.realpath(__file__))
FIREBASE_CREDENTIALS_PATH = os.path.join(dir_path, "fun-things-12caf-firebase-adminsdk-fbsvc-abf05155d3.json")

# Initialize Firebase Admin SDK (only do this once in your project)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

User = get_user_model()  # Reference CustomUser


@csrf_exempt
def register_or_login(request):
    """Verifies Firebase token and registers/logs in the user in Django DB."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Missing token"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)  # Ensure `auth` is from firebase_admin.auth
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email", "")

        user, created = CustomUser.objects.get_or_create(
            firebase_id=firebase_uid,
            defaults={"email": email, "username": email.split("@")[0]},
        )

        return JsonResponse({"message": "User authenticated", "new_user": created})
    except Exception as e:
        print(f"❌ Firebase Auth Error: {e}")
        return JsonResponse({"error": str(e)}, status=401)


def random_activity(request):
    """Returns a random 'thing to do' from the database."""
    count = NPSThingToDo.objects.count()
    if count == 0:
        return JsonResponse({"error": "No activities available"}, status=404)

    random_index = random.randint(0, count - 1)
    activity = NPSThingToDo.objects.all()[random_index]

    response_data = {
        "id": activity.nps_id,
        "title": activity.title,
        "description": activity.description,
        "latitude": activity.latitude,
        "longitude": activity.longitude,
        "url": activity.url,
        "image_url": activity.image_url,
        "tags": activity.tags,
        "topics": activity.topics,
        "activities": activity.activities,
        "season": activity.season,
        "age_recommendation": activity.age_recommendation,
        "accessibility": activity.accessibility,
        "pets_allowed": activity.pets_allowed,
    }

    return JsonResponse(response_data)
