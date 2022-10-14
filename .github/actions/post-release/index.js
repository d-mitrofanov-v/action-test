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
      console.log(branch);
      const ref = `refs/heads/${branch}`;

      const developBranch = await this.github.repos.getBranch({
          owner: this.owner,
          repo: this.repo,
          branch: 'develop'
      });
      console.log(developBranch);
      const developBranchSHA = developBranch.data.commit.sha;
      console.log(developBranch);

      try {
        const resp = await this.github.git.createRef({
          ref,
          sha: developBranchSHA,
          owner: this.owner,
          repo: this.repo,
        });

        return resp;
      } catch (error) {
          throw Error(error);
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
