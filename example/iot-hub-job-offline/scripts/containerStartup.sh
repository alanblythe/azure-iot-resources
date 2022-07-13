#!/bin/sh

cd /workspaces/azure-iot-resources/example/iot-hub-job-offline/.devcontainer/poc-cli

npm init -y && \
    npm install -y prompt esm arg --save && \
    npm link
    