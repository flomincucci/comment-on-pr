const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function run() {
    try {
        const myToken = core.getInput('repo-token');
        const client = github.getOctokit(myToken)

        const pr = github.context.payload.pull_request;
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;

        const prData = await client.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            mediaType: {
                format: 'diff'
            }
        });

        const diffText = prData.data.split('\n');
        
        let comments = [];
        //let newFile = false;
        let file = '';

        for ( let i=1; i < diffText.length; i++ ) {

            if(diffText[i-1].startsWith('---') && diffText[i].startsWith('+++')) {
                file = diffText[i].substr(6);
                //newFile = diffText[i] == ' --- /dev/null';
            }

            if(diffText[i].startsWith('+ ') && diffText[i-1].startsWith('- ')) {
                // Create diff comment
                comments.push([i, file, `Here's a change in the file ${file}`])
            }
        }

        console.log(pr.sha)
        await client.pulls.createReviewComment({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            body: comments[0][2],
            commit_id: pr.sha,
            path: comments[0][1],
            line: comments[0][0],
            side: "RIGHT"});

        /*return Promise.all(comments.map(async c => await client.pulls.createReviewComment({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            body: c[2],
            path: c[1],
            position: c[0],
            commit_id: pr.sha
        })))*/

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
