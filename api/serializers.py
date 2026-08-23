from rest_framework import serializers
from .models import Skill, Job, Resume

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    #added
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), source='required_skills', write_only=True
    )
    class Meta:
        model = Job
        fields= '__all__'

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Resume
        fields='__all__'
        