import django
django.setup()

from fun_things.core.recommenders import DistanceRecommender


dr = DistanceRecommender()
dr.recommend(37.7749, -122.4194)
