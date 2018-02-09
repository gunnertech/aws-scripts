/*
 * REQUIREMENTS
 * node v8.x.x or greater
 * 
 * SETUP:
 * $ npm install or yarn add
 * 
 * USAGE:
 * node createAccountForOrganization.js --accountName='TestTestTest13' --email=test13@gunnertech.com --userNameOnRootAccount=cody
 * 
 * DESCRIPTION:
 * creates a new account and adds it to your organization
 * creates a new group in the root account with admin access to the new account
 * adds the specified user to the new group
 */


var AWS = require('aws-sdk'),
  defaults = { 
    region: 'us-east-1', 
    accountName: false, 
    email: false,
    userNameOnRootAccount: false,
    sourceProfile: 'default'
  },
  argv = {...defaults, ...require('minimist')(process.argv.slice(2))},
  sleepms = require('sleep-ms'),
  organizations = new AWS.Organizations({apiVersion: '2016-11-28', region: argv.region}),
  fs = require('fs'),
  iam = new AWS.IAM();

  argv.accountAlias = argv.accountAlias || (argv.accountName||"").toLowerCase();




const promisify = require('util').promisify,
  organizationsDescribeOrganization = promisify(organizations.describeOrganization.bind(organizations)),
  organizationsCreateAccount = promisify(organizations.createAccount.bind(organizations)),
  organizationsDescribeCreateAccountStatus = promisify(organizations.describeCreateAccountStatus.bind(organizations)),
  iamCreateGroup = promisify(iam.createGroup.bind(iam)),
  iamAttachGroupPolicy = promisify(iam.attachGroupPolicy.bind(iam)),
  iamAddUserToGroup = promisify(iam.addUserToGroup.bind(iam)),
  iamCreatePolicy = promisify(iam.createPolicy.bind(iam)),
  asyncAppendFile = promisify(fs.appendFile.bind(fs));


for(var i in argv) {
  if(!argv[i]) {
    console.log(`you must pass --${i}=whatever`);
    process.exit(1);
  }
}

async function getRootAccountId(argv) {
  try {
    var data = await organizationsDescribeOrganization({});
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  const rootAccountId = data.Organization.MasterAccountArn.split(':')[4]

  console.log(rootAccountId);

  return {...argv, rootAccountId };
}

async function createAccount(argv) {
  var accountStatus = null;
  var creationStatusId = null;
  var accountId = null;

  var {accountName, email} = argv;
  var roleName = `${accountName.replace(/ /,'')}OrganizationAccountAccessRole`;

  var ticks = "...";

  try {
    var data = await organizationsCreateAccount({
      AccountName: accountName,
      Email: email,
      RoleName: roleName
    });
  
    creationStatusId = data.CreateAccountStatus.Id;
  
    while(accountStatus !== 'SUCCEEDED') {
      console.log("Creating Account"+(ticks+="."));
      console.log(accountStatus);
      var data = await organizationsDescribeCreateAccountStatus({
        CreateAccountRequestId: creationStatusId
      });
      creationStatusId = data.CreateAccountStatus.Id;
      accountStatus = data.CreateAccountStatus.State;
      accountId = data.CreateAccountStatus.AccountId;
      sleepms(3000);
    }
  } catch(err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating account!");

  return {...argv, roleName, accountId};
}

async function createGroup(argv) {
  var groupName = `${argv.accountName}Admins`;

  try {
    var data = await iamCreateGroup({
      GroupName: groupName,
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating group!");

  return {...argv, groupName};
}

async function createPolicy(argv) {
  var policyName = `${argv.accountName}Access`,
    policyArn = `arn:aws:iam::${argv.rootAccountId}:policy/${policyName}`,
    policyDocument = {
      "Version": "2012-10-17",
      "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Resource": [
                `arn:aws:iam::${argv.accountId}:role/${argv.roleName}`
            ]
        }
      ]
    }

  try {
    var data = await iamCreatePolicy({
      PolicyDocument: JSON.stringify(policyDocument),
      PolicyName: policyName,
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating policy!");

  return {...argv, policyArn};
}

async function attachGroupPolicy(argv) {
  try {
    var data = await iamAttachGroupPolicy({
      GroupName: argv.groupName,
      PolicyArn: argv.policyArn,
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done attaching policy to group!");

  return {...argv};
}

async function addUserToGroup(argv) {
  try {
    var data = await iamAddUserToGroup({
      GroupName: argv.groupName,
      UserName: argv.userNameOnRootAccount,
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done adding user to group!");

  return {...argv};
}

async function createAccountAlias(argv) {
  const iamCreateAccountAlias = promisify(argv.newAccountIam.createAccountAlias.bind(argv.newAccountIam));

  try {
    var data = await iamCreateAccountAlias({
      AccountAlias: argv.accountAlias,
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating account alias!");

  return {...argv};
}

async function createUser(argv) {
  const iamCreateUser = promisify(argv.newAccountIam.createUser.bind(argv.newAccountIam));

  try {
    var data = await iamCreateUser({
      UserName: 'awsmobilehub',
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating user!");

  return {...argv};
}

async function attachUserPolicy(argv) {
  const iamAttachUserPolicy = promisify(argv.newAccountIam.attachUserPolicy.bind(argv.newAccountIam));

  try {
    var data = await iamAttachUserPolicy({
      UserName: 'awsmobilehub',
      PolicyArn: 'arn:aws:iam::aws:policy/AWSMobileHub_FullAccess'
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done attaching policy!");

  return {...argv};
}

async function createAccessKey(argv) {
  const iamCreateAccessKey = promisify(argv.newAccountIam.createAccessKey.bind(argv.newAccountIam));

  try {
    var data = await iamCreateAccessKey({
      UserName: 'awsmobilehub',
    })
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  console.log("Done creating access key!");

  return {...argv, ...data};
}

async function writeCredentialsToFile(argv) {
  var credentials = `
[${argv.accountAlias}developer]
role_arn = arn:aws:iam::${argv.accountId}:role/${argv.roleName}
source_profile = ${argv.sourceProfile}
region = ${argv.region}

`;
  try {
    var data = await asyncAppendFile( `${process.env['HOME']}/.aws/credentials`, credentials)
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  argv.profile = `${argv.accountAlias}developer`;

  const newAccountCredentials = new AWS.SharedIniFileCredentials({
    profile: argv.profile,
    filename: `${process.env['HOME']}/.aws/credentials`
  });

  const newAccountIam = new AWS.IAM({credentials: newAccountCredentials, region: argv.region});

  return {...argv, newAccountIam};
}

async function writeUserCredentialsToFile(argv) {
  var credentials = `
[profile ${argv.accountAlias}awsmobilehub]
aws_access_key_id = ${argv.AccessKey.AccessKeyId}
aws_secret_access_key = ${argv.AccessKey.SecretAccessKey}
region = ${argv.region}

`;
  try {
    var data = await asyncAppendFile(
      `${process.env['HOME']}/.aws/credentials`, 
      credentials
    )
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  try {
    var data = await asyncAppendFile(
      `${process.env['HOME']}/.aws/config`, 
      credentials
    )
  } catch (err) {
    console.log(err, err.stack); 
    process.exit(1);
  }

  return {...argv};
}

createAccount(argv)
  .then(getRootAccountId)
  .then(createPolicy)
  .then(createGroup)
  .then(attachGroupPolicy)
  .then(addUserToGroup)
  .then(writeCredentialsToFile)
  .then(createAccountAlias)
  .then(createUser)
  .then(attachUserPolicy)
  .then(createAccessKey)
  .then(writeUserCredentialsToFile)
  .then(console.log)
  .catch(console.log)