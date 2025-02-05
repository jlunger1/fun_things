"""
URL configuration for fun_things project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from fun_things.core.views import (
    get_activity, 
    create_activity,
    upload_image,
    register_or_login,
    update_preference,
    get_user_favorites,
    get_user_created,
    get_activity_details,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('core/get-activity/', get_activity, name='get_activity'),
    path('core/create-activity/', create_activity, name='create_activity'),
    path('core/upload-image/', upload_image, name='upload_image'),
    path('core/register-or-login/', register_or_login, name='register_or_login'),
    path('core/update-preference/', update_preference, name='update_preference'),
    path('core/get-user-favorites/', get_user_favorites, name='get_user_favorites'),
    path('core/get-user-created/', get_user_created, name='get_user_created'),
    path('core/get-activity-details/<int:activity_id>/', get_activity_details, name='get_activity_details'),
]

# ✅ Serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

