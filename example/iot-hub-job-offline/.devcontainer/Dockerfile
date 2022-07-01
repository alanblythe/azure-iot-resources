FROM ubuntu

RUN apt update && \
    apt install -qy curl && \
    curl -sL https://aka.ms/InstallAzureCLIDeb | bash && \
    curl -sSL https://get.docker.com/ | sh && \
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose
