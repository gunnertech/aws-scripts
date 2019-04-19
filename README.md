# Setup

## Prerequisites

Install the following

1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html#install-tool-pip) (if you have it, make sure it's the latest)
2. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
3. [NVM](https://github.com/creationix/nvm#installation-and-update)
4. Node ``$ nvm install node``

Also, you'll need to have an existing AWS account with admin access with your credentials in ~/.aws/credentials and ~/.aws/config

It should look something like this:

### ~/.aws/credentials
````
[default]
aws_access_key_id=xxxxxxxxxxxxx
aws_secret_access_key=xxxxxxxxxxxxx
````

### ~/.aws/config
````
[default]
region=us-east-1
output=json
````

## AWS Accounts

The following will create new accounts and organize them within your AWS Organization. To see all options, open the file

````
$ ./organization add -o <client-name> -n <project-name>-dev -e <project-name>-dev@gunnertech.com
$ ./organization add -o <client-name> -n <project-name>-staging -e <project-name>-staging@gunnertech.com
$ ./organization add -o <client-name> -n <project-name>-prod -e <project-name>-prod@gunnertech.com
````


## Project 

The following will pull down a project template and partially configure it.

Once it is finished, you will need to open the project's README.md to finish setup

````
$ ./project <project-name> <developer-name> (destination)
# open up that project's README.md and finish the job!
````
