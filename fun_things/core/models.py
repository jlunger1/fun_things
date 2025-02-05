from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.gis.db import models as gis_models

class CustomUser(AbstractUser):
    """Custom user model storing login, location, saved activities, and votes."""
    firebase_id = models.CharField(max_length=255, blank=True, null=True)
    saved_activities = models.ManyToManyField("NPSThingToDo", blank=True, related_name="saved_by_users")
    submitted_activities = models.ManyToManyField("NPSThingToDo", blank=True, related_name="submitted_by_users")
    thumbs_up = models.ManyToManyField("NPSThingToDo", blank=True, related_name="liked_by_users")
    thumbs_down = models.ManyToManyField("NPSThingToDo", blank=True, related_name="disliked_by_users")

    def __str__(self):
        return self.firebase_id


class NPSThingToDo(models.Model):
    """Stores 'things to do' from the National Park Service API."""

    nps_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    location = gis_models.PointField(blank=True, null=True)  # Store as a PointField

    accessibility = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)


    def __str__(self):
        return self.title
