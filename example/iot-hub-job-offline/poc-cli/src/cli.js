// import arg from 'arg';
// import configstore from 'configstore';
// import shell from 'shelljs';
// import chalk from 'chalk';
// import prompts from 'prompts';

const arg = require('arg');
const configstore = require('configstore');
const shell = require('shelljs');
const chalk = require('chalk');
const prompts = require('prompts');
const fs = require('fs');


//import packageJson from '../package.json';

const config = new configstore('poc-cli-iot-hub-job-offline');
const crypto = require('crypto');
const yargs = require('yargs');

const standardSettingsLocation = '/workspaces/azure-iot-resources/example/iot-hub-job-offline/poc-cli/standard-settings.json';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--hubname': String,
      '-h': '--hubname'
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false,
  };
}

function isAzCliLoggedIn() {
  if (shell.exec('az account show', { silent: true }).code !== 0) {
    return false;
  }

  return true;
}

function runCommandAndLog(command, silent = false) {
  console.log(`${chalk.bgGray.white('running command')} ${chalk.bgYellow.black(command)}`);
  return shell.exec(command, { silent: silent })
}

function getAzureAccountListAsArray() {
  var json = runCommandAndLog('az account list', true);
  var parsed = JSON.parse(json);
  return parsed;
}

async function verifyAzAccount() {
  var accountJson = runCommandAndLog('az account show');
  console.log(`${chalk.green('You\'re logged into shown Azure account.')}`)

  var response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to use this account? Y - yes, N - select another',
    initial: true
  })

  if (response.value) {
    config.all.subscriptionId = accountJson.subscriptionId;
  }

  return response.value;
}

async function likeToLogIntoAzAccountQuestion(bypassPrompt = false) {

  if (!bypassPrompt) {
    var response = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Would you like to login to one now?',
      initial: true
    });

    if (!response.value) {
      return false;
    }
  }

  var status = runCommandAndLog('az login --use-device-code');

  return status.code == 0;
}

async function getAzureLocationsArray() {
  var array = [];

  array.push({ id: "eastus", name: "East US" });
  array.push({ id: "eastus2", name: "East US 2" });
  array.push({ id: "westus", name: "West US" });

  return array;
}

async function verifyLocation() {

  var location = config.get('location');

  var selectLocation = true;

  if (location) {
    var message = `${chalk.yellow('Your currently selected location is: ')}${chalk.blue(location)}. ${chalk.yellow('Would you like to keep this selection')}`;

    var response = await prompts({
      type: 'confirm',
      name: 'value',
      message: message,
      initial: true
    });

    selectLocation = !response.value;

    if (!selectLocation) {
      return location;
      //console.log(`${chalk.yellow('Your currently selected location is: ')}${chalk.blue(location)}. ${chalk.yellow('Would you like to keep this selection')}`);
    }
  }

  var locations = await getAzureLocationsArray();

  var picklist = [];

  locations.forEach(item => {
    picklist.push(
      {
        title: `${item.name}-${item.id}`,
        value: item.id
      }
    );
  });

  var response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick an Azure location',
    initial: 1,
    choices: picklist
  });

  location = response.value;
  return location;
}

async function pickSubscription() {

  var accounts = getAzureAccountListAsArray();

  var picklist = [];

  accounts.forEach(item => {
    picklist.push(
      {
        title: `${item.name}-${item.id}`,
        value: item.id
      }
    );
  });

  console.log(accounts.length);

  var response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a subscription',
    initial: 1,
    choices: picklist
  });

  var subscriptionId = response.value;

  config.set('subscriptionId', subscriptionId);
  console.log(`${chalk.yellow('Saved the selected subscriptionId: ')}${chalk.blue(subscriptionId)} ${chalk.yellow('to the stored config')}`);

  runCommandAndLog(`az account set --subscription ${subscriptionId}`);
  console.log(`${chalk.green('Successfully set active subscription to: ')}${subscriptionId}`)

  return subscriptionId;
}

async function checkAzLoggedIn() {
  if (isAzCliLoggedIn()) {
    if (await verifyAzAccount()) {
      return true;
    }
  }
  else {
    console.log(`${chalk.yellow('You\'re not logged into the Azure CLI.')}`)
    var likeToLogin = await likeToLogIntoAzAccountQuestion();

    if (!likeToLogin) {
      console.log(`${chalk.red('Aborting CLI due to user response.')}`)
      return false;
    }
  }

  var response = await pickSubscription();
  return response;
}

function getRandomString(length) {
  var randomString = crypto.randomBytes(length).toString('hex');
  return randomString;
}

function getBaseName() {
  var text = fs.readFileSync(standardSettingsLocation);
  return JSON.parse(text).baseName;
}

function verifyOrSetUniqueName() {

  if (!config.all.uniqueName) {
    var randomString = getRandomString(3);
    config.set('uniqueName', randomString);
    console.log(`${chalk.yellow('Generated and saved random string for uniqueName: ')}${chalk.blue(randomString)}`);
  }

  return config.all.uniqueName;
}

async function createAzureDeployment(options) {
  //az deployment group what-if

  var params = [];

  params.push({ name: 'location', value: options.location });
  params.push({ name: 'baseName', value: getBaseName() });
  params.push({ name: 'uniqueName', value: config.get('uniqueName') });

  var paramString = '';

  params.forEach(item => {
    paramString += `${item.name}=${item.value} `;
  });

  paramString = paramString.trimEnd();

  //TODO parameterize this
  var command = `az deployment sub create --location ${options.location} --parameters ${paramString} --template-file /workspaces/azure-iot-resources/example/iot-hub-job-offline/deploy/main.bicep`;

  //--location eastus2 --name'
  //deploy/main.bicep

  if (options.dryRun) {
    command += ' --what-if';
  }

  var status = runCommandAndLog(`${command}`);
  var success = status.code == 0;

  if (!success) {
    console.log(`${chalk.red('Failed to deploy resources, see terminal for details')}`);
    return success;
  }

  console.log(`${chalk.green('Successfully deployed Azure resources.')}`);

  return success;
}

async function deployAzureResources(options) {
  //await createResourceGroup();
  return await createAzureDeployment(options);

  // az deployment group create \
  // --name demoRGDeployment \
  // --resource-group ExampleGroup \
  // --template-file main.bicep \
  // --parameters storageAccountType=Standard_GRS
}

async function initializeConfig() {
  verifyOrSetUniqueName();
}

async function cli(args) {
  //let options = parseArgumentsIntoOptions(args);
  //console.log(options);

  await initializeConfig();

  //console.log(`${chalk.green('Continue.')}`)

  const argv = yargs
    .command('login', 'Login to Azure cli')
    .command('deploy', 'Deploys the necessary Azure resources')
    .option('dry', {
      alias: 'd',
      description: 'estimate deployed resources',
      type: 'boolean'
    })
    .command('command <subcommand>', 'run subcommand', (yargs) => {
      yargs.positional('subcommand', {
        describe: 'subcommand',
        type: 'string'
      })
    })
    .command('devices', 'Allows you to query or create devices', {
      create: {
        description: 'create',
        alias: 'c',
        type: 'string'
      },
      query: {
        description: 'query',
        alias: 'q',
        type: 'string'
      }
    })
    .option('dry', {
      alias: 'd',
      description: 'estimate deployed resources',
      type: 'boolean'
    })
    .help()
    .alias('help', 'h').argv;

  console.log(argv);

  var command = argv._[0];
  var success = false;

  var response = false;

  if (command != 'login') {
    response = await checkAzLoggedIn();

    if (!response) {
      console.log(`${chalk.yellow('A subscription was not selected, aborting.')}`)
      return;
    }
  }

  switch (command) {
    case 'deploy':
      location = await verifyLocation();
      success = await deployAzureResources(
        {
          dryRun: argv.dryrun ? true : false,
          location: location
        });
      break;
    case 'devices':
      console.log('yay devices');
      var response = await checkAzLoggedIn();
      break;
    case 'login':
      success = await likeToLogIntoAzAccountQuestion(true);
      break;
  }

  if (!success) {
    console.log(`${chalk.red(`Failed to run the ${chalk.yellow(command)} command. Aborting`)}`);
    return;
  }

  console.log(`${chalk.green(`Successfully ran the ${chalk.yellow(command)} command.`)}`);

  return;
}

cli(process.argv);

module.exports = {
  cli
};
