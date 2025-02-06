from abc import ABC, abstractmethod
from typing import Optional
from fun_things.core.models import NPSThingToDo
import random
import math
from django.db import connection
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point

class BaseRecommender(ABC):
    """Abstract base class for recommenders."""

    @abstractmethod
    def recommend(self, **kwargs) -> Optional[NPSThingToDo]:
        """Returns a recommended NPSThingToDo object based on given criteria."""
        pass

class RandomRecommender(BaseRecommender):
    """Recommender that selects a completely random activity."""

    def recommend(self) -> Optional[NPSThingToDo]:
        count = NPSThingToDo.objects.count()
        if count == 0:
            return None
        
        random_index = random.randint(0, count - 1)
        return NPSThingToDo.objects.all()[random_index]

class DistanceRecommender(BaseRecommender):
    """Recommender that selects activities weighted by proximity to the user."""

    LAMBDA = 0.000003  # Controls how fast probability decays with distance

    def recommend(self, latitude: float, longitude: float) -> Optional[NPSThingToDo]:
        """Recommend an activity based on distance-weighted probabilities."""
        
        # Create a Point object for the user's location
        user_location = Point(longitude, latitude, srid=4326)  # SRID 4326 is standard for lat/lon
        print('user_location', user_location)
        
        # Query database using Django ORM
        activities = (
            NPSThingToDo.objects
            .filter(location__isnull=False)  # Ensure we have a valid location
            .annotate(distance=Distance("location", user_location))  # Compute distance
            .order_by("distance")  # Sort results by proximity
        )

        if not activities.exists():
            return None

        # Assign weights using exponential decay
        weighted_choices = [
            (activity.id, math.exp(-self.LAMBDA * activity.distance.m))  # Distance in meters
            for activity in activities
        ]

        # Normalize weights into a probability distribution
        total_weight = sum(w for _, w in weighted_choices)
        weighted_choices = [(activity_id, w / total_weight) for activity_id, w in weighted_choices]

        # Sample an activity using weighted probabilities
        activity_id = random.choices(
            [activity_id for activity_id, _ in weighted_choices],
            weights=[w for _, w in weighted_choices],
            k=1
        )[0]

        print('activity location', NPSThingToDo.objects.get(id=activity_id).location)

        return NPSThingToDo.objects.get(id=activity_id)
