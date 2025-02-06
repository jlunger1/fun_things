from rest_framework import serializers
from fun_things.core.models import NPSThingToDo, CustomUser
from django.contrib.gis.geos import Point

from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import NPSThingToDo

class NPSThingToDoSerializer(serializers.ModelSerializer):
    favorites_count = serializers.IntegerField(source="favorites.count", read_only=True)
    thumbs_up_count = serializers.IntegerField(source="thumbs_up.count", read_only=True)
    thumbs_down_count = serializers.IntegerField(source="thumbs_down.count", read_only=True)
    location = serializers.SerializerMethodField()
    location_input = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = NPSThingToDo
        fields = [
            "id", "title", "url", "image_url",
            "favorites_count", "thumbs_up_count", "thumbs_down_count",
            "description", "location", "location_input"
        ]

    def get_location(self, obj):
        """Returns a dictionary representation of the location."""
        if obj.location:
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x,
                "address": obj.address if hasattr(obj, "address") else None,
            }
        return None

    def to_internal_value(self, data):
        """Convert incoming JSON location into a Point object."""
        location_data = data.get("location")
        if location_data:
            latitude = location_data.get("latitude")
            longitude = location_data.get("longitude")
            if latitude is not None and longitude is not None:
                data["location"] = Point(float(longitude), float(latitude))  # Note: (lng, lat) order
        return super().to_internal_value(data)


class CustomUserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'firebase_id', 'saved_activities', 'submitted_activities', 'thumbs_up', 'thumbs_down']