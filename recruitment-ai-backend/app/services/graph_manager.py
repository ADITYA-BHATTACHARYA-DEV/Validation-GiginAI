import networkx as nx

class GraphManager:
    def __init__(self):
        self.G = nx.MultiDiGraph() # Multi-Graph to handle multiple roles over time

    def calculate_work_depth(self, experience_data: list):
        """
        experience_data example: [{'company': 'Startup X', 'size': 10, 'role': 'Lead', 'impact': 0.9}]
        """
        for exp in experience_data:
            company = exp['company']
            # Higher weight for small companies with high impact
            ownership_score = 1 / (exp['size'] / 100) # Simple inverse proxy
            complexity = exp.get('impact', 0.5) * ownership_score
            
            self.G.add_node(company, size=exp['size'], type='employer')
            self.G.add_edge('Candidate', company, weight=complexity, role=exp['role'])

        # Depth is the weighted average of professional edges
        weights = [d['weight'] for u, v, d in self.G.edges(data=True)]
        return sum(weights) / len(weights) if weights else 0