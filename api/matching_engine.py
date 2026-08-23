import math
from datetime import datetime
from collections import deque

# Directed Acyclic Graph defining skill relationships and inheritance weights
SKILL_GRAPH = {
    "JavaScript": {"children": {"React": 0.75, "Node.js": 0.75}, "parents": {}},
    "React": {"children": {}, "parents": {"JavaScript": 0.85}},
    "Node.js": {"children": {"Express": 0.80}, "parents": {"JavaScript": 0.85}},
    "Python": {"children": {"Django": 0.70, "FastAPI": 0.70}, "parents": {}},
    "Django": {"children": {}, "parents": {"Python": 0.90}},
    "Data Structures": {"children": {"Algorithms": 0.85}, "parents": {}},
    "Algorithms": {"children": {}, "parents": {"Data Structures": 0.85}},
    "Machine Learning": {"children": {"Transformer Architectures": 0.80, "Diffusion Models": 0.80}, "parents": {}},
    "Transformer Architectures": {"children": {}, "parents": {"Machine Learning": 0.90}},
    "Diffusion Models": {"children": {}, "parents": {"Machine Learning": 0.90}},
}

def get_graph_match_score(required_skill: str, candidate_skill: str) -> float:
    """Computes semantic distance score via BFS traversal on SKILL_GRAPH."""
    if required_skill.lower() == candidate_skill.lower():
        return 1.0

    visited = set()
    queue = deque([(candidate_skill, 1.0)])

    while queue:
        current_skill, current_weight = queue.popleft()
        if current_skill.lower() == required_skill.lower():
            return current_weight

        visited.add(current_skill)
        node = SKILL_GRAPH.get(current_skill, {"children": {}, "parents": {}})

        # Traverse parents (e.g., React -> knows JavaScript)
        for parent, weight in node.get("parents", {}).items():
            if parent not in visited:
                queue.append((parent, current_weight * weight))

        # Traverse children (e.g., Python -> some credit for Django)
        for child, weight in node.get("children", {}).items():
            if child not in visited:
                queue.append((child, current_weight * weight))

    return 0.0

def calculate_time_decay(last_used_year: int, decay_lambda: float = 0.15) -> float:
    """Calculates exponential retention factor based on years inactive."""
    current_year = datetime.now().year
    delta_t = max(0, current_year - last_used_year)
    return math.exp(-decay_lambda * delta_t)

def compute_overall_match(required_skills: list, candidate_skill_data: list) -> float:
    """
    candidate_skill_data: List of dicts, e.g. [{'name': 'React', 'last_used': 2024}, ...]
    required_skills: List of required skill names, e.g. ['JavaScript', 'Django']
    """
    if not required_skills:
        return 100.0
    if not candidate_skill_data:
        return 0.0

    total_score = 0.0

    for req in required_skills:
        best_skill_score = 0.0
        for cand_skill in candidate_skill_data:
            s_name = cand_skill.get("name", "")
            s_year = cand_skill.get("last_used", datetime.now().year)

            graph_score = get_graph_match_score(req, s_name)
            if graph_score > 0.0:
                decay = calculate_time_decay(s_year)
                final_skill_score = graph_score * decay
                best_skill_score = max(best_skill_score, final_skill_score)

        total_score += best_skill_score

    # Normalize to 0 - 100%
    match_percentage = (total_score / len(required_skills)) * 100
    return round(min(100.0, match_percentage), 2)