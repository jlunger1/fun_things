from rest_framework import serializers
from fun_things.core.models import NPSThingToDo, CustomUser

class NPSThingToDoSerializer(serializers.ModelSerializer):
    favorites_count = serializers.IntegerField(source="favorites.count", read_only=True)
    thumbs_up_count = serializers.IntegerField(source="thumbs_up.count", read_only=True)
    thumbs_down_count = serializers.IntegerField(source="thumbs_down.count", read_only=True)

    class Meta:
        model = NPSThingToDo
        fields = [
            "id", "title", "url", "image_url", "pets_allowed", "accessibility",
            "favorites_count", "thumbs_up_count", "thumbs_down_count",
            "description", "location"
        ]


class CustomUserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'firebase_id', 'saved_activities', 'submitted_activities', 'thumbs_up', 'thumbs_down']