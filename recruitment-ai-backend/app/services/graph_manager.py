import networkx as nx

class GraphManager:
    def calculate_work_depth(self, experience_data: list):
        """Uses graph theory to measure career progression"""
        if not experience_data:
            return 0.0
            
        G = nx.DiGraph()
        total_impact = 0
        
        # Building a career path graph
        for i, job in enumerate(experience_data):
            G.add_node(i, company=job['company'], impact=job['impact'])
            total_impact += job['impact']
            if i > 0:
                G.add_edge(i-1, i)
        
        # Simple depth heuristic: impact * path length
        return (total_impact / len(experience_data)) * 10