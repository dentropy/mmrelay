FROM quay.io/tembo/tembo-local:latest
# https://github.com/tembo-io/tembo-images/blob/main/tembo-local/Dockerfile
# https://github.com/tembo-io/tembo-images/blob/main/standard-cnpg/Dockerfile

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
RUN trunk install postgis
# # For postrest - https://docs.postgrest.org/en/stable/index.html
# RUN sudo apt-get update
# RUN sudo apt-get install -y curl
# RUN curl -L https://github.com/PostgREST/postgrest/releases/download/v12.2.8/postgrest-v12.2.8-linux-static-x86-64.tar.xz -o postgrest.tar.xz \
#     && tar -xf postgrest.tar.xz \
#     && mv postgrest /usr/local/bin/ \
#     && rm postgrest.tar.xz
# RUN echo "**** cleanup ****" && \
#     apt-get remove --purge -y curl gnupg && \
#     apt-get autoremove -y && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Optional:
# Specify extra Postgres configurations by copying into this directory
# COPY custom.conf $PGDATA/extra-configs

# Optional:
# Specify startup SQL scripts by copying into this directory
# COPY startup.sql $PGDATA/startup-scripts