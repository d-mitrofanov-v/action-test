const core = require('@actions/core');
const { github, context } = require('@actions/github');

async function run() {
  const {owner, repo} = context.repo;

  const oktokit = github.rest.getOctokit(process.env.GITHUB_TOKEN);

  const branch = core.getInput('branch');
  const sha = core.getInput('sha');

  branch = branch.replace('refs/heads/', '');
  const ref = `refs/heads/${branch}`;

  try {
    await oktokit.rest.repos.getBranch({
      owner: owner,
      repo: repo,
      branch,
    });
  } catch (error) {
    if (error.name === 'HttpError' && error.status === 404) {
      const resp = await oktokit.rest.git.createRef({
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
