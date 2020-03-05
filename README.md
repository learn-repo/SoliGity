# EECE 571G Project

## Configuring your environment

1. [Install Node LTS](https://nodejs.org/en/download/) (v12.14.0), which will also install NPM (you should be able to execute `node --version` and `npm --version` on the command line).

2. [Install Yarn](https://yarnpkg.com/en/docs/install) (v1.12+). You should be able to execute `yarn --version` afterwards.

## Quick Start

```
# Clone the repository
git clone git@github.com:ZhenpengWu/EECE-571G.git

# Go inside the directory
cd EECE-571G

# Install dependencies for backend
yarn install

# Go inside the directory for frontend
cd frontend

# Install dependencies for frontend
yarn install

# Back to root directory
cd ..

# Setup database (run all the migrations)
npx sequelize-cli db:migrate

# Start backend server and frontend
yarn start
