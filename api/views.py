from datetime import datetime
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Skill, Job, Resume
from .serializers import SkillSerializer, JobSerializer, ResumeSerializer
from .matching_engine import compute_overall_match, get_graph_match_score

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

        # Retrieve structured skills data, with fallback to extracted_skills
        candidate_skills = resume.skills_data
        if not candidate_skills:
            current_year = datetime.now().year
            candidate_skills = [
                {"name": s.name, "last_used": current_year}
                for s in resume.extracted_skills.all()
            ]

        candidate_skill_names = [s.get("name", "") for s in candidate_skills]
        jobs = Job.objects.all()
        match_results = []

        for job in jobs:
            required_skill_names = list(job.required_skills.values_list('name', flat=True))

            if not required_skill_names:
                match_score = 0.0
                matched_skills = []
                missing_skills = []
            else:
                # Execute Graph Traversal + Time Decay calculation
                match_score = compute_overall_match(required_skill_names, candidate_skills)

                # Classify skills for UI feedback
                matched_skills = [
                    req for req in required_skill_names
                    if any(get_graph_match_score(req, cand) > 0.0 for cand in candidate_skill_names)
                ]
                missing_skills = [
                    req for req in required_skill_names
                    if req not in matched_skills
                ]

            match_results.append({
                'job_id': job.id,
                'job_title': job.title,
                'match_percentage': match_score,
                'matched_skills': matched_skills,
                'missing_skills': missing_skills
            })

        match_results.sort(key=lambda x: x['match_percentage'], reverse=True)
        return Response(match_results)