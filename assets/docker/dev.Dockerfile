FROM ghcr.io/roadrunner-server/roadrunner:2025 AS roadrunner
FROM docker.io/rockylinux:9

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}
ARG WORK_DIR=/workspace
ENV HOME="/home/${USERNAME}"
ENV CONTAINER="container"
ENV PATH="${HOME}/.bun/bin:${HOME}/.local/bin:${PATH}"

ARG BIN_DEPLOY_PREP
ARG BIN_DEPLOY_REQ

COPY . /tmp/app
COPY --from=roadrunner /usr/bin/rr /usr/local/bin/rr

WORKDIR /tmp/app

RUN dnf install -y bash
RUN bash "./${BIN_DEPLOY_PREP}" && bash "./${BIN_DEPLOY_REQ}"

WORKDIR /

RUN rm -rf /tmp/app

RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m -d ${HOME} ${USERNAME} 

RUN mkdir -p ${WORK_DIR} && \
    chown ${USERNAME}:${USERNAME} -R ${WORK_DIR} && \
    mkdir -p "${HOME}/.local/bin" && \
    chown ${USERNAME}:${USERNAME} -R ${HOME}

RUN git config --global --add safe.directory ${WORK_DIR}

USER ${USERNAME}

RUN mkdir -p "${WORK_DIR}/public"

ENTRYPOINT ["/bin/bash", "/entry_dev.sh"]