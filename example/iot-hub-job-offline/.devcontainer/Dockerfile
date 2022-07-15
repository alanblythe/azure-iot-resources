FROM ubuntu

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    # [Optional] Add sudo support. Omit if you don't need to install software after connecting.
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME
 
COPY scripts/installLatestNvm.sh /root/

RUN apt update && \
    apt install -qy curl screen nano git wget && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -qy nodejs && \
    curl -sL https://aka.ms/InstallAzureCLIDeb | bash && \
    curl -sSL https://get.docker.com/ | sh && \
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose && \
    chmod +x /root/installLatestNvm.sh && \
    /root/installLatestNvm.sh
    
# RUN useradd -ms /bin/bash vscode
# RUN usermod -aG sudo vscode
# USER vscode

COPY config/.screenrc /home/vscode/

# [Optional] Set the default user. Omit if you want to keep the default as root.
USER $USERNAME

RUN sudo usermod --shell /bin/bash vscode

# ADD scripts/ /root/scripts/
# ADD poc-cli/ /root/poc-cli/

# RUN chmod u+x /root/scripts/*

# WORKDIR /root/poc-cli

##RUN npm config get prefix

# RUN npm init -y && \
#     npm install -y prompt esm arg --save && \
#     npm link

