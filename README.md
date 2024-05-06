# Personal Portfolio Website

This is a static website built with Vue.js and Gridsome. It serves as a personal portfolio to showcase my work.

## Technologies Used

- Vue.js
- Gridsome
- Docker
- GitHub Actions
- Github Pages

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

- NodeJS 16 and above
- Docker and docker-compose installed on your local system.

## Installation and Setup

1. Clone the repository
    ```bash
    git clone https://github.com/SourasishBasu/SourasishBasu.github.io.git
    ```

2. Navigate to the project directory
    ```bash
    cd SourasishBasu.github.io
    ```
### Setup Locally

Install `Yarn`, `Gridsome CLI` and all the required packages for the site.

```bash
npm install yarn
npm install --global @gridsome/cli
yarn install
gridsome develop
```

### Setup Via Docker

Run Docker Compose to build and start the application

```bash
docker-compose up
```

Access the website locally in your browser at `localhost:8082`

## Deployment

This project is deployed using Github Pages via GitHub Actions. Execute the following to deploy through your repository.

```bash
yarn deploy / npm deploy
```

Whenever changes are pushed to the `gh-pages` branch of the GitHub repository, GitHub Actions automatically builds the project and deploys the contents of the `dist` directory to Github Pages.

### Acknowledgments

- This project is based on [dev-adewale/portfolio](https://github.com/dev-adewale/portfolio)
