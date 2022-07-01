FROM node

WORKDIR /src

COPY /src .

RUN npm init -y && \
    npm install azure-iothub uuid --save

# CMD ["node", "scheduleJobService.js"]
CMD ["/bin/sh","-c","while sleep 1000; do :; done"]
