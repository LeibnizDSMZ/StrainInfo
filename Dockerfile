FROM docker.io/rockylinux:9 AS appbuilder

ARG BIN_DEPLOY
ARG FIX_CONFIG
ARG STAGE
ENV CONTAINER="container"

COPY . /tmp/app

WORKDIR /tmp/app

RUN dnf install -y bash gettext-devel intltool
RUN mkdir -p "${HOME}/.local/bin" && CGO_ENABLED=0 bash "./${BIN_DEPLOY}"

FROM ghcr.io/roadrunner-server/roadrunner:2025 AS roadrunner
FROM docker.io/alpine:3.22

ARG USER_GID
ARG BIN_DEPLOY_REQ_NGINX
ARG BIN_DEPLOY_ADD_CRON
ARG DOCKER_ENV_BE
ARG BACKEND_STAGE_PORT
ARG DOCKER_ENV_DIR
ARG SERVER_WEB_CONFS_DIR
ENV DOCKER_ENV_BE=${DOCKER_ENV_BE}
ENV BACKEND_STAGE_PORT=${BACKEND_STAGE_PORT}

RUN apk --no-cache update && apk add --upgrade bash apk-tools && apk upgrade --available
RUN apk --no-cache add nginx nginx-mod-http-set-misc 

COPY "./${BIN_DEPLOY_REQ_NGINX}" /req.nginx.sh
COPY "./${BIN_DEPLOY_ADD_CRON}" /add_cron.sh

RUN bash /req.nginx.sh && rm /req.nginx.sh

RUN rm -rf /etc/nginx/http.d/* || true 
RUN mkdir -p /etc/nginx/http.d

COPY --from=roadrunner /usr/bin/rr /usr/local/bin/rr
COPY --from=appbuilder $SERVER_WEB_CONFS_DIR/* /etc/nginx/http.d/
COPY --from=appbuilder /entry.sh  /entry.sh
COPY --from=appbuilder $DOCKER_ENV_DIR/* $DOCKER_ENV_DIR/

RUN bash /add_cron.sh && rm /add_cron.sh

WORKDIR /var/www/

RUN rm -rf /var/www/*

COPY --from=appbuilder /var/www/ ./

RUN apk --no-cache add shadow && groupmod --gid ${USER_GID} nginx && apk del shadow
RUN chown -R nginx:nginx /var/www/

HEALTHCHECK --interval=5m --timeout=3s CMD /health.sh

ENTRYPOINT ["/bin/bash", "/entry.sh"]