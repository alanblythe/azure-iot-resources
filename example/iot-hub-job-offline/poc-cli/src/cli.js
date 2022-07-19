const arg = require('arg');
const configstore = require('configstore');
const shell = require('shelljs');
const chalk = require('chalk');
const prompts = require('prompts');
const fs = require('fs');
const prettyjson = require('prettyjson');

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
    message: `${chalk.yellow('Would you like to use this account? Y - yes, N - select another')}`,
    initial: true
  })

  if (response.value) {
    config.set('subscriptionId', accountJson.subscriptionId);
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
      return new OperationResult(false);
    }
  }

  var status = runCommandAndLog('az login --use-device-code');

  return new OperationResult(status.code == 0);
}

async function getAzureLocationsArray() {
  var array = [];

  array.push({ id: "eastus", name: "East US" });
  array.push({ id: "eastus2", name: "East US 2" });
  array.push({ id: "westus", name: "West US" });

  array = array.slice(0, 0);

  var result = runCommandAndLog("az account list-locations", true);

  var locations = JSON.parse(result.stdout);

  Array.prototype.sortBy = function (p) {
    return this.slice(0).sort(function (a, b) {
      return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
    });
  }

  locations = locations.sortBy('displayName');

  return locations;
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
      return new OperationResult(true, location);
    }
  }

  var locations = await getAzureLocationsArray();

  var picklist = [];

  locations.forEach(item => {
    picklist.push(
      {
        title: `${item.displayName}-${item.name}`,
        value: item.name
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

  config.set('location', location);

  return new OperationResult(true, location);
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
      return new OperationResult(true);
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

  var subscriptionId = await pickSubscription();

  return new OperationResult(true, subscriptionId);
}

function getRandomString(length) {
  var randomString = crypto.randomBytes(length).toString('hex');
  return randomString;
}

function getBaseName() {
  var text = fs.readFileSync(standardSettingsLocation);
  return JSON.parse(text).baseName;
}

function getUniqueName() {
  return config.get('uniqueName');
}



function verifyOrSetUniqueName() {

  var uniqueName = config.get('uniqueName');
  if (!uniqueName) {
    var randomString = getRandomString(3);
    uniqueName = randomString;
    config.set('uniqueName', uniqueName);
    console.log(`${chalk.yellow('Generated and saved random string for uniqueName: ')}${chalk.blue(uniqueName)}`);
  }

  return uniqueName;
}

async function createAzureDeployment(options) {
  var params = [];

  params.push({ name: 'location', value: options.location });
  params.push({ name: 'baseName', value: getBaseName() });
  params.push({ name: 'uniqueName', value: getUniqueName() });

  var paramString = '';

  params.forEach(item => {
    paramString += `${item.name}=${item.value} `;
  });

  paramString = paramString.trimEnd();

  var command = `az deployment sub create --name ${getBaseName()}-${getUniqueName()} --location ${options.location} --parameters ${paramString} --template-file /workspaces/azure-iot-resources/example/iot-hub-job-offline/deploy/main.bicep`;

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
  var success = await createAzureDeployment(options);

  if (success) {
    return new OperationResult(true);
  }

  return new OperationResult(false);
}

async function initializeConfig() {
  verifyOrSetUniqueName();
}

async function showConfig() {
  console.log(`Showing config for: ${config.path}`);
  var message = prettyjson.render(config.all);
  console.log(message);
  return new OperationResult(true);
}

async function cleanup() {

  var resourceGroupName = await getResourceGroupName();
  command = `az resource list --resource-group ${resourceGroupName} -o table`
  runCommandAndLog(command);

  var response = await prompts({
    type: 'confirm',
    name: 'value',
    message: `${chalk.yellow('The list resources, along with the resource group, will be deleted. Are you sure you want to continue?')}`,
    initial: false
  })

  if (!response.value) {
    return new OperationResult(false);
  }

  command = `az group delete --name ${resourceGroupName} --yes`
  runCommandAndLog(command);

  return new OperationResult(true);
}

async function getResourceGroupName() {
  var getResourceGroupName = `rg-${getBaseName()}-${config.get('uniqueName')}`;
  return getResourceGroupName;
}

async function cli(args) {
  await initializeConfig();

  const argv = yargs
    .command('login', 'Login to Azure cli')
    .command('deploy', 'Deploys the necessary Azure resources')
    .command('config', 'Shows the current stored config')
    .command('changelocation', 'Changes the configured and stored Azure region')
    .command('cleanup', 'Deletes all Azure resources')
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
  var response = false;

  var noLoginCommands = [];
  noLoginCommands.push('login');
  noLoginCommands.push('config');

  if (!noLoginCommands.includes(command)) {
    response = await checkAzLoggedIn();

    if (!response) {
      console.log(`${chalk.yellow('A subscription was not selected, aborting.')}`)
      return;
    }
  }

  var result;

  switch (command) {
    case 'deploy':
      result = await verifyLocation();
      location = result.data;
      result = await deployAzureResources(
        {
          dryRun: argv.dryrun ? true : false,
          location: location
        });
      break;
    case 'devices':
      var result = await checkAzLoggedIn();
      break;
    case 'changelocation':
      result = await verifyLocation();
      break;
    case 'login':
      result = await likeToLogIntoAzAccountQuestion(true);
      break;
    case 'cleanup':
      result = await cleanup();
      break;
    case 'config':
      result = await showConfig();
      break;
  }

  if (!result.success) {
    console.log(`${chalk.red(`Failed to run the ${chalk.yellow(command)} command. Aborting`)}`);
    return;
  }

  console.log(`${chalk.green(`Successfully ran the ${chalk.yellow(command)} command.`)}`);

  return;
}

const OperationResult = class {
  constructor(success, data, message) {
    this.success = success;
    this.data = data;
    this.message = message;
  }
};

cli(process.argv);

module.exports = {
  cli
};
