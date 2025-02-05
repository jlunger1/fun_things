import random
from django.http import JsonResponse
from fun_things.core.models import NPSThingToDo, CustomUser

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials
import os
import json

from fun_things.core.recommenders import RandomRecommender, DistanceRecommender

# get the absolute path of the current file
dir_path = os.path.dirname(os.path.realpath(__file__))
FIREBASE_CREDENTIALS_PATH = os.path.join(dir_path, "fun-things-12caf-firebase-adminsdk-fbsvc-abf05155d3.json")

# Initialize Firebase Admin SDK (only do this once in your project)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

User = get_user_model()  # Reference CustomUser

@csrf_exempt
def get_user_favorites(request):
    """Returns a list of activity IDs that the user has favorited."""
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        # ✅ Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]

        # ✅ Get User
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        # ✅ Retrieve Favorited Activities
        favorite_activities = user.saved_activities.values_list("id", flat=True)

        return JsonResponse({"favorites": list(favorite_activities)})

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def update_preference(request):
    print('attempting to update preferences')
    """Updates user preferences for saved activities, thumbs up, or thumbs down."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        # ✅ Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]

        # ✅ Get User
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        # ✅ Parse Request Data
        data = json.loads(request.body)
        activity_id = data.get("activity_id")
        action = data.get("action")  # "favorite", "upvote", "downvote"

        if not activity_id or action not in ["favorite", "upvote", "downvote"]:
            return JsonResponse({"error": "Invalid request parameters"}, status=400)

        # ✅ Get Activity
        try:
            activity = NPSThingToDo.objects.get(id=activity_id)
        except NPSThingToDo.DoesNotExist:
            return JsonResponse({"error": "Activity not found"}, status=404)

        # ✅ Perform Action
        if action == "favorite":
            if activity in user.saved_activities.all():
                user.saved_activities.remove(activity)
                message = "Activity removed from favorites"
            else:
                user.saved_activities.add(activity)
                message = "Activity added to favorites"

        elif action == "upvote":
                user.thumbs_up.add(activity)
                user.thumbs_down.remove(activity)
                message = "Activity upvoted"
        
        elif action == "downvote":
                user.thumbs_down.add(activity)
                user.thumbs_up.remove(activity)
                message = "Activity downvoted"

        # ✅ Save changes
        user.save()
        return JsonResponse({"message": message, "action": action, "activity_id": activity_id})

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


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

        user, created = CustomUser.objects.get_or_create(
            firebase_id=firebase_uid,
        )

        return JsonResponse({"message": "User authenticated", "new_user": created})
    except Exception as e:
        print(f"❌ Firebase Auth Error: {e}")
        return JsonResponse({"error": str(e)}, status=401)


def get_activity(request):

    """Returns a random 'thing to do' from the database."""

    # get latitude and longitude
    lat = float(request.GET.get("latitude"))
    lon = float(request.GET.get("longitude"))

    recommender = DistanceRecommender()
    activity = recommender.recommend(latitude=lat, longitude=lon)

    response_data = {
        "id": activity.id,
        "title": activity.title,
        "description": activity.description,
        "url": activity.url,
        "image_url": activity.image_url,
        "accessibility": activity.accessibility,
        "pets_allowed": activity.pets_allowed,
    }

    return JsonResponse(response_data)

@csrf_exempt
def get_activity_details(request, activity_id):
    print('getting activity details')
    """Returns full details of a specific activity given its ID."""
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=400)

    try:
        activity = NPSThingToDo.objects.get(id=activity_id)

        response_data = {
            "id": activity.id,
            "title": activity.title,
            "url": activity.url,
            "image_url": activity.image_url,
            "description": activity.description,
            "accessibility": activity.accessibility,
            "pets_allowed": activity.pets_allowed,
        }

        return JsonResponse(response_data)

    except NPSThingToDo.DoesNotExist:
        return JsonResponse({"error": "Activity not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
