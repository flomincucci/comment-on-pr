const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
    try {
        const myToken = core.getInput('repo-token');
        const client = github.getOctokit(myToken)

        //core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        const pr = github.context.payload.pull_request;
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        const data = await client.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: pr.number
        });

        /*const diffUrl = data.data.diff_url
        const res = await axios.get(diffUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3.diff'
            }
        })
        console.log(res);*/

        await client.issues.createComment({
            owner: owner,
            repo: repo,
            //pull_number: pr.number,
            issue_number: github.context.issue.number,
            body: data.data.diff_url
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function processDiff(diffUrl) {

    return res.data;
}

run();
