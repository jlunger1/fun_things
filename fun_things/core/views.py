import random
from django.http import JsonResponse
from fun_things.core.models import NPSThingToDo

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])  # ✅ Requires authentication
def get_profile(request):
    """Returns the authenticated user's profile info."""
    user = request.user  # Get the logged-in user
    return Response({
        "username": user.username,
        "email": user.email,
        "city": user.city if hasattr(user, "city") else None  # Handle missing field gracefully
    })

@api_view(["POST"])
def login_user(request):
    """Handles user login and returns JWT tokens."""
    data = request.data
    username = data.get("username")
    password = data.get("password")

    # Validate input
    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate user
    user = authenticate(username=username, password=password)

    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful!",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        })
    else:
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
def register_user(request):
    """Registers a new user"""
    data = request.data

    # Check required fields
    if not all(field in data for field in ["username", "email", "password"]):
        return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user with hashed password
        user = User.objects.create(
            username=data["username"],
            email=data["email"],
            password=make_password(data["password"]),  # Hash password
            city=data.get("city", ""),  # Ensure city is optional
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully!",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
