const { Octokit } = require('@octokit/rest');

let octokit = new Octokit();

module.exports = {

    getInstance: () => {
        return octokit;
    },

    getStoredGithubToken: () => {
        return process.env.token;
    },

    setGithubCredentials: async (user, password) => {
        octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
    },

    registerNewToken: async () => {
        try {
            const response = await octokit.oauthAuthorizations.createAuthorization({
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'soligity'
            });
            const token = response.data.token;
            if (token) {
                process.env.token = token;
                return token;
            } else {
                throw new Error("Missing Token", "GitHub token was not found in the response");
            }
        } catch (err) {
            console.log(err);
        }
    },

    githubAuth: (token) => {
        octokit = new Octokit({
            auth: `token ${token}`
        })

    }
}