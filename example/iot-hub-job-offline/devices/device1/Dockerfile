FROM node

WORKDIR /src

COPY /src .

RUN npm init -y && \
    npm install -y azure-iot-device azure-iot-device-mqtt --save

CMD ["node", "simDevice.js"]
# CMD ["/bin/bash"]
