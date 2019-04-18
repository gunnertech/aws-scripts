# Setup

## Prerequisites

Install the following

1. AWS CLI (https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html#install-tool-pip)
2. Git (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
3. NVM (https://github.com/creationix/nvm#installation-and-update)
4. Node ``nvm install``

## AWS Accounts
````
$ ./organization add -o <client-name> -n <project-name>-dev -e <project-name>-dev@gunnertech.com
$ ./organization add -o <client-name> -n <project-name>-staging -e <project-name>-staging@gunnertech.com
$ ./organization add -o <client-name> -n <project-name>-prod -e <project-name>-prod@gunnertech.com
````


## Project 
````
$ ./project <project-name> <client-name> <developer-name> (destination)
# open up that project's README.md and finish the job!
````
