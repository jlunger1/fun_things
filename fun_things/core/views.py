import random
from django.http import JsonResponse
from fun_things.core.models import NPSThingToDo

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
