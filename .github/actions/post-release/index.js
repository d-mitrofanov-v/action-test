const core = require('@actions/core');
const { github, context } = require('@actions/github');

async function run() {
  const {owner, repo} = context.repo;
  github = new github.getOctokit(process.env.GITHUB_TOKEN);

  const branch = core.getInput('branch');
  const sha = core.getInput('sha');

  branch = branch.replace('refs/heads/', '');
  const ref = `refs/heads/${branch}`;

  try {
    await github.rest.repos.getBranch({
      owner: owner,
      repo: repo,
      branch,
    });
  } catch (error) {
    if (error.name === 'HttpError' && error.status === 404) {
      const resp = await github.rest.git.createRef({
        ref,
        sha: sha || context.sha,
        ...context.repo,
      });

      return resp;
    } else {
      throw Error(error);
    }
  }

};

run();
