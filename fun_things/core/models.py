from django.db import models

class NPSThingToDo(models.Model):
    """Stores 'things to do' from the National Park Service API."""

    nps_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)

    location = models.CharField(max_length=255, blank=True, null=True)
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
