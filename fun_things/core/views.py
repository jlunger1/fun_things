import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import firebase_admin
from firebase_admin import auth, credentials
import os
import json

from fun_things.core.models import NPSThingToDo, CustomUser
from fun_things.core.serializers import NPSThingToDoSerializer
from fun_things.core.recommenders import DistanceRecommender
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import urllib.parse

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
    """Returns a list of favorited activities for the authenticated user."""
    
    # Get the Authorization header and validate it
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        # Verify Firebase token and get user
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        # Ensure `saved_activities` is correctly referenced
        if hasattr(user, "saved_activities"):
            favorites_queryset = user.saved_activities.all()
            favorites_data = NPSThingToDoSerializer(favorites_queryset, many=True).data
            return JsonResponse({"favorites": favorites_data})
        else:
            return JsonResponse({"error": "User has no saved activities"}, status=404)

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_user_created(request):
    """Returns a list of created activities for the authenticated user."""
    
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        # Authenticate the user
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        # Fetch user's created activities
        created_activities = NPSThingToDoSerializer(user.submitted_activities.all(), many=True).data
        
        # ✅ Fix the response key name
        return JsonResponse({"created_activities": created_activities})

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def update_preference(request):
    """Updates user preferences for saved activities, thumbs up, or thumbs down."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        data = json.loads(request.body)
        activity_id = data.get("activity_id")
        action = data.get("action")

        if not activity_id or action not in ["favorite", "upvote", "downvote"]:
            return JsonResponse({"error": "Invalid request parameters"}, status=400)

        activity = NPSThingToDo.objects.get(id=activity_id)

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

        user.save()
        return JsonResponse({"message": message, "action": action, "activity": NPSThingToDoSerializer(activity).data})
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except NPSThingToDo.DoesNotExist:
        return JsonResponse({"error": "Activity not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def register_or_login(request):
    """Verifies Firebase token and registers/logs in the user."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Missing token"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user, created = CustomUser.objects.get_or_create(firebase_id=firebase_uid)
        return JsonResponse({"message": "User authenticated", "new_user": created})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=401)

def get_activity(request):
    """Returns a recommended 'thing to do' based on location."""
    lat = float(request.GET.get("latitude"))
    lon = float(request.GET.get("longitude"))
    recommender = DistanceRecommender()
    activity = recommender.recommend(latitude=lat, longitude=lon)
    return JsonResponse(NPSThingToDoSerializer(activity).data)

@csrf_exempt
def create_activity(request):
    """Creates a new activity submitted by the user and associates it with their submitted activities."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JsonResponse({"error": "Unauthorized"}, status=401)

    token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = CustomUser.objects.get(firebase_id=firebase_uid)

        data = json.loads(request.body)
        serializer = NPSThingToDoSerializer(data=data)

        print('data', data)

        if serializer.is_valid():
            print('serializer is valid')
            activity = serializer.save()
            print('serializer saved')
            user.submitted_activities.add(activity)
            user.save()
            return JsonResponse({"message": "Activity created successfully", "activity": serializer.data}, status=201)
        else:
            return JsonResponse({"error": serializer.errors}, status=400)
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_activity_details(request, activity_id):
    """Returns details of a specific activity by ID."""
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=400)

    try:
        activity = NPSThingToDo.objects.get(id=activity_id)
        return JsonResponse(NPSThingToDoSerializer(activity).data)
    except NPSThingToDo.DoesNotExist:
        return JsonResponse({"error": "Activity not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def upload_image(request):
    """Stores an uploaded image locally and returns a properly formatted URL."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    if "image" not in request.FILES:
        return JsonResponse({"error": "No image provided"}, status=400)

    try:
        image = request.FILES["image"]
        
        # ✅ Ensure "activities" directory exists inside MEDIA_ROOT
        activities_dir = os.path.join(settings.MEDIA_ROOT, "activities")
        os.makedirs(activities_dir, exist_ok=True)  

        # ✅ Normalize filename (remove spaces and special chars)
        filename = image.name.replace(" ", "_")  # Replace spaces with underscores
        filename = urllib.parse.quote(filename)  # URL-encode the filename
        image_name = os.path.join("activities", filename)

        # ✅ Save the file in /media/activities/
        file_path = default_storage.save(image_name, ContentFile(image.read()))

        # ✅ Generate a properly formatted URL
        media_base_url = request.build_absolute_uri(settings.MEDIA_URL).rstrip("/")
        full_image_url = f"{media_base_url}/{urllib.parse.quote(file_path)}"

        return JsonResponse({"image_url": full_image_url, "image_path": file_path}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
