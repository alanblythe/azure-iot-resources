import arg from 'arg';
import configstore from 'configstore';
import shell from 'shelljs';
import chalk from 'chalk';
import prompts from 'prompts';
//import packageJson from '../package.json';

const config = new configstore('poc-cli-iot-hub-job-offline');
const crypto = require('crypto');
const yargs = require('yargs');

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

function isAzCliLoggedIn()
{  
  if (shell.exec('az account show', {silent:true}).code !== 0) {
    return false;
  }

  return true;
}

function runCommandAndLog(command, silent=false){
  console.log(`${chalk.bgGray.white('running command')} ${chalk.bgYellow.black(command)}`);
  return shell.exec(command, {silent:silent})
}

function getAzureAccountListAsArray(){
  var json = runCommandAndLog('az account list',true);
  var parsed = JSON.parse(json);
  return parsed;
}

async function verifyAzAccount()
{
  runCommandAndLog('az account show');
  console.log(`${chalk.green('You\'re logged into shown Azure account.')}`)

  var response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to use this account? Y - yes, N - select another',
    initial: true
  })

  return response.value;
}

async function likeToLogIntoAzAccountQuestion()
{
  var response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to login to one now?',
    initial: true
  })

  if(!response.value)
  {
    return false;
  }

  runCommandAndLog('az login --use-device-code');

  return response.value;
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
  
  config.set('subscriptionId', response.value);
  console.log(`${chalk.yellow('Saved the selected subscriptionId: ')}${chalk.blue(response.value)} ${chalk.yellow('to the stored config')}`);

  return response.value;
}

async function checkAzLoggedIn() {
  if(isAzCliLoggedIn())
  {
    if(await verifyAzAccount())
    {
      return true;
    }
  }
  else
  {
    console.log(`${chalk.yellow('You\'re not logged into the Azure CLI.')}`)
    var likeToLogin = await likeToLogIntoAzAccountQuestion();

    if(!likeToLogin)
    {
      console.log(`${chalk.red('Aborting CLI due to user response.')}`)
      return false;
    }
  }

  var response = await pickSubscription();
  return response;
}

function genUniqueString() {
  var randomString = crypto.randomBytes(4).toString('hex');
  return randomString;
}

async function getOrSetResourceGroupName(uniqueString) {
  var rgName = config.get('rgName');

  if(rgName)
  {
    return rgName;
  }
  
  rgName = `rg-poc-job-${uniqueString}`;
  config.set('rgName', rgName);

  console.log(`${chalk.yellow('Generated and set resource group name: ')}${chalk.blue(rgName)}`);

  return rgName;
}

async function deployResources() {

  if(!config.all.uniqueString)
  {
    var randomString = genUniqueString();
    config.set('uniqueString',randomString); 
    console.log(`${chalk.yellow('Generated and saved random string: ')}${chalk.blue(randomString)}`);
  }

  var rgName = getOrSetResourceGroupName(config.all.uniqueString);
  console.log(rgName);
  
  console.log(config.all);

  return false;
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  console.log(options);

  var response = await checkAzLoggedIn();     

  if(!response)
  {
    console.log(`${chalk.yellow('A subscription was not selected, aborting.')}`)
    return;
  }

  console.log(`${chalk.green('Continue.')}`)

  var response = await deployResources();

  if(!response)
  {
    console.log(`${chalk.red('There was a problem deploying resources aborting.')}`)
    return;
  }
}
   