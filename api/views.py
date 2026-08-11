from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Skill,Job,Resume
from .serializers import SkillSerializer, JobSerializer, ResumeSerializer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    @action(detail=True, methods=['get'])
    def match(self, request, pk=None):
        resume = self.get_object()

        resume_skills = set(resume.extracted_skills.values_list('name',flat='True'))

        jobs = Job.objects.all()
        match_results = []

        for job in jobs:
            job_skills= set(job.required_skills.values_list('name', flat=True))

            if not job_skills:
                match_score = 0.0
            else:
                overlap = resume_skills.intersection(job_skills)
                match_score = (len(overlap)/len(job_skills))*100

            match_results.append({
                'job_id': job.id,
                'job_title': job.title,
                'match_percentage': round(match_score,2),
                'matched_skills': list(overlap),
                'missing_skills': list(job_skills-resume_skills)
            })

        match_results.sort(key=lambda x: x['match_percentage'],reverse=True)

        return Response(match_results)