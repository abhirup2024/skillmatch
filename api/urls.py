from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, JobViewSet, ResumeViewSet

router = DefaultRouter()
router.register(r'skills',SkillViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'resume', ResumeViewSet)

urlpatterns = [
    path('',include(router.urls)),
]