from django.db import models

# Create your models here.
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def  __str__(self):
        return self.name

class Job(models.Model):
    title = models.CharField(max_length=200)
    description= models.TextField()
    required_skills = models.ManyToManyField(Skill, related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Resume(models.Model):
    candidate_name = models.CharField(max_length=200)
    extracted_skills = models.ManyToManyField(Skill, related_name='resumes')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume: {self.candidate_name}"