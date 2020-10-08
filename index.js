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

        const prDiff = await client.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            mediaType: {
                format: 'diff'
            }
        });

        const prData = await client.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
        });

        const diffText = prDiff.data.split('\n');
        
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
                const lineDiff = findDiff(diffText[i-1].substr(1), diffText[i].substr(1))
                comments.push([i, file, `The diff is ${lineDiff}`])
            }
        }

        return Promise.all(comments.map(async c => await client.pulls.createReviewComment({
            owner: owner,
            repo: repo,
            pull_number: pr.number,
            commit_id: prData.data.head.sha,
            body: c[2],
            path: c[1],
            line: c[0],
            side: "RIGHT"
        })))

    } catch (error) {
        core.setFailed(error.message);
    }
}

function findDiff(str1, str2){ 
    let diff = "";
    const orig = (str2.length > str1.length)? str1 : str2;
    const dest = (str2.length > str1.length)? str2 : str1;
    dest.split('').forEach(function(val, i){
        if (val != orig.charAt(i))
            diff += val ;         
    });
    return diff;
}

run();
