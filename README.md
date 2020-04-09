# SoliGity Deploy and Test Procedure

## Configuring your environment

1. [Install Node LTS](https://nodejs.org/en/download/) (v12.14.0), which will also install NPM (you should be able to execute `node --version` and `npm --version` on the command line).

2. [Install Yarn](https://yarnpkg.com/en/docs/install) (v1.12+). You should be able to execute `yarn --version` afterwards.

## Quick Start

```
# Clone the repository
git clone git@github.com:SoliGity/SoliGity.git
# Go inside the directory
cd SoliGity

# Install dependencies for backend
yarn install

# Setup database (run all the migrations)
npx sequelize-cli db:migrate

# Go inside the directory for frontend
cd frontend

# Install dependencies for frontend
yarn install

# Setup SoliGity contract
truffle compile
truffle migrate

# Back to root directory
cd ..

# Start backend server and frontend
yarn start
