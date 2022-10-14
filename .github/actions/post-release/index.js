const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');


class PostReleaseManager {
  constructor() {
    const {owner, repo} = context.repo;

    this.owner = owner;
    this.repo = repo;
    this.github = new GitHub(process.env.GITHUB_TOKEN);
  }

  async createBranch(context) {
      let branch = core.getInput('branch');
      const sha = core.getInput('sha');

      branch = branch.replace('refs/heads/', '');
      const ref = `refs/heads/${branch}`;

      try {
        await this.github.rest.repos.getBranch({
          owner: this.owner,
          repo: this.repo,
          branch,
        });
      } catch (error) {
        if (error.name === 'HttpError' && error.status === 404) {
          const resp = await this.github.rest.git.createRef({
            ref,
            sha: sha || context.sha,
            ...context.repo,
          });

          return resp;
        } else {
          throw Error(error);
        }
      }
  }

  async run() {
    try {
      console.log('Create new branch');
      let that = this;

      await that.createBranch();
    } catch (error) {
      core.setFailed(error.message);
    }
  }
}

new PostReleaseManager().run();
