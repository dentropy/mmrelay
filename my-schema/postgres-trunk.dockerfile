FROM quay.io/tembo/tembo-local:latest

# Optional:
# Install any extensions you want with Trunk
RUN trunk install pgcrypto
RUN trunk install pgvector
RUN trunk install age
RUN trunk install index_advisor
RUN trunk install pg_cron
RUN trunk install pg_search
RUN trunk install pg_analytics
RUN trunk install pg_jsonschema
RUN trunk install pgmq

# Optional:
# Specify extra Postgres configurations by copying into this directory
# COPY custom.conf $PGDATA/extra-configs

# Optional:
# Specify startup SQL scripts by copying into this directory
# COPY startup.sql $PGDATA/startup-scripts