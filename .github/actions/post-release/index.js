const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');


class PostReleaseManager {
  constructor() {
    const {owner, repo} = context.repo;

    this.owner = owner;
    this.repo = repo;
    this.github = new GitHub(process.env.GITHUB_TOKEN);
  }

  async getDevBranch() {
    const developBranch = await this.github.repos.getBranch({
      owner: this.owner,
      repo: this.repo,
      branch: 'develop'
    });

    return developBranch;
  }

  async createBranch(developBranch) {
    let branch = core.getInput('branch');
    branch = branch.replace('refs/heads/', '');
    const ref = `refs/heads/${branch}`;

    const developBranchSHA = developBranch.data.commit.sha;

    try {
      const resp = await this.github.git.createRef({
        ref,
        sha: developBranchSHA,
        owner: this.owner,
        repo: this.repo,
      });
      console.log(resp);
      return resp.data.commit.sha;
    } catch (error) {
        throw Error(error);
      }
  }

  async mergeBranches() {

    try {
      const resp = await this.github.repos.merge({
        owner: this.owner,
        repo: this.repo,
        base: 'master-to-develop',
        head: 'master',
      });

      return resp;
    } catch (error) {
      throw Error(error);
    }
  }

  async run() {
    try {
      let that = this;
      console.log('Create new branch');
      const developBranch = await that.getDevBranch();

      await that.createBranch(developBranch);
      console.log('Merging branches');
      await that.mergeBranches();
    } catch (error) {
      core.setFailed(error.message);
    }
  }
}

new PostReleaseManager().run();
