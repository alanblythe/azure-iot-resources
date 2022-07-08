FROM node

WORKDIR /src

RUN npm init -y && \
    npm install -y azure-iot-device azure-iot-device-mqtt --save

COPY /src .

CMD ["node", "simDevice.js"]
# CMD ["/bin/bash"]
