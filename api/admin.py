from django.contrib import admin

# Register your models here.
from .models import Skill, Job, Resume

admin.site.register(Skill)
admin.site.register(Job)
admin.site.register(Resume)