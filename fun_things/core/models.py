from django.db import models

import requests
from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    """Custom user model storing login, location, saved activities, and votes."""
    
    email = models.EmailField(unique=True)
    city = models.CharField(max_length=255, blank=True, null=True)  # User-supplied location
    latitude = models.FloatField(blank=True, null=True)  # Estimated latitude
    longitude = models.FloatField(blank=True, null=True)  # Estimated longitude
    saved_activities = models.ManyToManyField("NPSThingToDo", blank=True, related_name="saved_by_users")
    thumbs_up = models.ManyToManyField("NPSThingToDo", blank=True, related_name="liked_by_users")
    thumbs_down = models.ManyToManyField("NPSThingToDo", blank=True, related_name="disliked_by_users")

    # Fix conflicting related names
    groups = models.ManyToManyField(Group, related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="customuser_permissions", blank=True)

    def __str__(self):
        return self.username


class NPSThingToDo(models.Model):
    """Stores 'things to do' from the National Park Service API."""

    nps_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    tags = models.JSONField(default=list)  # Store tags as a list of strings
    topics = models.JSONField(default=list)  # Store topics as a list of strings
    activities = models.JSONField(default=list)  # Related activities

    season = models.CharField(max_length=255, blank=True, null=True)
    age_recommendation = models.CharField(max_length=50, blank=True, null=True)
    accessibility = models.TextField(blank=True, null=True)
    pets_allowed = models.BooleanField(default=False)

    raw_data = models.JSONField()  # Store the full API response

    def __str__(self):
        return self.title
