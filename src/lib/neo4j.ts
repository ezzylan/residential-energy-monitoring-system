import neo4j from "neo4j-driver";

export const driver = neo4j.driver(
  import.meta.env.NEO4J_URI,
  neo4j.auth.basic(
    import.meta.env.NEO4J_USERNAME,
    import.meta.env.NEO4J_PASSWORD,
  ),
);
