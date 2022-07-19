#!/bin/sh

cd /workspaces/azure-iot-resources/example/iot-hub-job-offline/.devcontainer/poc-cli

npm init -y && \
     npm install -y prompt prompts esm arg shelljs yargs prettyjson chalk@4.1.2 configstore@3.1.5 --save && \
     sudo npm link
    