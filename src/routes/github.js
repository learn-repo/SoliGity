var express = require("express");
const models = require("../../db/models")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { Octokit } = require("@octokit/rest");

import { authCheck } from "../middlewares/authCheck";

var router = express.Router();

router.post("/setGithubCredentials", authCheck, async (req, res, next) => {
    const { gitHubUsername, gitHubPassword } = req.body;
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const cipherText = CryptoJS.AES.encrypt(
        gitHubPassword,
        process.env.CRYPTO_SECRET
    );
    await models.User.update({
        gitHubUsername,
        gitHubPassword: cipherText.toString()
    }, { where: { id } }
    );
    res.json({});
});

router.get("/repos/:page", authCheck, async (req, res, next) => {
    const page = req.params.page || 1;
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const users = await models.User.findAll({ where: { id } });
    const user = users[0];
    const bytes = CryptoJS.AES.decrypt(
        (user.gitHubPassword).toString(),
        process.env.CRYPTO_SECRET
    );
    const password = bytes.toString(CryptoJS.enc.Utf8);
    const octokit = new Octokit({
        auth: {
            username: user.gitHubUsername,
            password
        }
    });
    const data = await octokit.repos.list({
        username: user.gitHubUsername,
        page,
        visibility: "public",
    });
    res.json(data);
});

router.get("/commits/", authCheck, async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const users = await models.User.findAll({ where: { id } });
    const user = users[0];
    const repoPath = req.query.repo;
    const bytes = CryptoJS.AES.decrypt(
        user.gitHubPassword.toString(),
        process.env.CRYPTO_SECRET
    );
    const password = bytes.toString(CryptoJS.enc.Utf8);
    const octokit = new Octokit({
        auth: {
            username: user.gitHubUsername,
            password
        }
    });
    const [owner, repo] = repoPath.split("/");
    const data = await octokit.repos.listCommits({
        owner,
        repo
    });
    res.json(data);
});

router.post("/issue/create", authCheck, async (req, res, next) => {
    try {
        const { owner, repo, title, body } = req.body;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;
        const users = await models.User.findAll({ where: { id } });
        const user = users[0];
        const bytes = CryptoJS.AES.decrypt(
            (user.gitHubPassword).toString(),
            process.env.CRYPTO_SECRET
        );
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
        const data = await octokit.issues.create({
            owner, repo, title, body
        });
        res.json(data);
    } catch (err) {
        res.status(400).json(err.message);
    }
});

router.post("/repo/fork", authCheck, async (req, res, next) => {
    try {
        const { owner, repo } = req.body;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;
        const users = await models.User.findAll({ where: { id } });
        const user = users[0];
        const bytes = CryptoJS.AES.decrypt(
            (user.gitHubPassword).toString(),
            process.env.CRYPTO_SECRET
        );
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
        const data = await octokit.repos.createFork({
            owner, repo
        });
        res.json(data);
    } catch (err) {
        res.status(400).json(err.message);
    }
});

router.post("/repo/pr/close", authCheck, async (req, res, next) => {
    try {
        const { owner, repo, pull_number } = req.body;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;
        const users = await models.User.findAll({ where: { id } });
        const user = users[0];
        const bytes = CryptoJS.AES.decrypt(
            (user.gitHubPassword).toString(),
            process.env.CRYPTO_SECRET
        );
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
        const data = await octokit.pulls.update({
            owner,
            repo,
            pull_number,
            state: "closed",
        });
        res.json(data);
    } catch (err) {
        res.status(400).json(err.message);
    }
});

router.post("/repo/pr/approve", authCheck, async (req, res, next) => {
    try {
        const { owner, repo, pull_number } = req.body;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;
        const users = await models.User.findAll({ where: { id } });
        const user = users[0];
        const bytes = CryptoJS.AES.decrypt(
            (user.gitHubPassword).toString(),
            process.env.CRYPTO_SECRET
        );
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
        let data = await octokit.pulls.createReview({
            owner,
            repo,
            pull_number,
            event: "APPROVE",
            comments: []
        });
        data = await octokit.pulls.merge({
            owner,
            repo,
            pull_number,
        })
        res.json(data);
    } catch (err) {
        res.status(400).json(err.message);
    }
});

router.post("/repo/pr", authCheck, async (req, res, next) => {
    try {
        const { owner, repo, title, head, base } = req.body;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;
        const users = await models.User.findAll({ where: { id } });
        const user = users[0];
        const bytes = CryptoJS.AES.decrypt(
            (user.gitHubPassword).toString(),
            process.env.CRYPTO_SECRET
        );
        const password = bytes.toString(CryptoJS.enc.Utf8);
        const octokit = new Octokit({
            auth: {
                username: user.gitHubUsername,
                password
            }
        });
        const data = await octokit.pulls.create({
            owner,
            repo,
            title,
            head,
            base
        });
        res.json(data);
    } catch (err) {
        res.status(400).json(err.message);
    }
});

module.exports = router;