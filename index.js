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
        let line = 0;
        //let newFile = false;
        let file = '';

        for ( let i=0; i < diffText.length; i++ ) {

            if(diffText[i].startsWith('---') && diffText[i+1].startsWith('+++')) {
                file = diffText[i+1].substr(4);
                //newFile = diffText[i] == ' --- /dev/null';
            }

            line = (diffText[i].startsWith('@@'))? 0 : line + 1;

            if(diffText[i].startsWith('-') && diffText[i+1].startsWith('+')) {
                // Create diff comment
                comments.push([line, file, `Here's a change in the file ${file}`])
            }
        }

        return Promise.all(comments.map(async c => await client.pulls.createReviewComment({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            body: c[2],
            path: c[1],
            line: c[0],
            commit_id: pr.sha
        })))

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
