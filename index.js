const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const myToken = core.getInput('repo-token');
        const client = github.getOctokit(myToken)

        //core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
        const pr = github.context.payload.pull_request;
        const data = await client.pulls.listFiles({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: pr.number
        });

        core.debug(data);


    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
