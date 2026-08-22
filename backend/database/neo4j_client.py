import os
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)

class Neo4jConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
            
            # Default to local dev credentials if not set
            uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "password")
            
            try:
                cls._instance.driver = GraphDatabase.driver(uri, auth=(user, password))
                cls._instance.driver.verify_connectivity()
                logger.info("Connected to Neo4j successfully.")
            except Exception as e:
                logger.error(f"Failed to connect to Neo4j: {e}")
                cls._instance.driver = None
        return cls._instance

    def close(self):
        if self.driver:
            self.driver.close()

    def query(self, query: str, parameters: dict = None):
        """Execute a Cypher query against the Neo4j database."""
        if not self.driver:
            logger.warning("Neo4j driver not initialized. Cannot run query.")
            return []
            
        try:
            with self.driver.session() as session:
                result = session.run(query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Neo4j query execution error: {e}")
            raise e

def get_neo4j():
    """Returns the Neo4jConnection singleton."""
    return Neo4jConnection()
