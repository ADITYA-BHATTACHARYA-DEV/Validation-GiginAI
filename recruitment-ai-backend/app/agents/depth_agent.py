import networkx as nx

class DepthAgent:
    def __init__(self):
        # Initializing a directed graph to represent career flow
        self.career_graph = nx.DiGraph()

    def calculate_depth(self, experience_list: list):
        """
        Calculates a quantitative score (0-100) based on career progression.
        Expects a list of dicts: [{'company': str, 'impact': float, 'duration': int}]
        """
        if not experience_list:
            return 0.0

        G = self.career_graph
        G.clear()
        
        total_weighted_score = 0
        
        for i, job in enumerate(experience_list):
            # Impact score (0.1 to 1.0) and duration weight
            impact = job.get('impact', 0.5)
            duration_weight = min(job.get('duration', 12) / 24, 2.0) # Cap weight at 2 years
            
            node_score = impact * duration_weight
            G.add_node(i, score=node_score)
            
            total_weighted_score += node_score
            
            # Create edges between consecutive jobs to represent path
            if i > 0:
                G.add_edge(i-1, i)

        # Calculate depth: (Sum of Node Scores / Number of Roles) * Scaler
        raw_score = (total_weighted_score / len(experience_list)) * 20
        return min(round(raw_score, 2), 100.0)