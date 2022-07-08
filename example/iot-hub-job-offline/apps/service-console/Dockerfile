FROM node

WORKDIR /src

RUN apt update && \
    apt install -qy nano && \
    npm init -y && \
    npm install azure-iothub uuid --save

COPY /src .

# CMD ["node", "scheduleJobService.js"]
CMD ["/bin/sh","-c","while sleep 1000; do :; done"]
