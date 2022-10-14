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
      branch: 'master'
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
      return resp;
    } catch (error) {
        throw Error(error);
      }
  }

  async createPR() {

    try {
      const resp = await this.github.pulls.create({
        owner: this.owner,
        repo: this.repo,
        base: 'master-to-develop',
        head: 'master',
        title: 'Master to develop into develop'
      });

      return resp.number;
    } catch (error) {
      throw Error(error);
    }
  }

  async updatePR(prNum) {
    const resp = await this.github.pulls.updateBranch({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNum,
    });
    return resp;
  }

  async run() {
    try {
      let that = this;
      console.log('Create new branch');
      const developBranch = await that.getDevBranch();

      await that.createBranch(developBranch);
      console.log('Merging branches');
      const prNum = await that.createPR();

      await that.updatePR(prNum);
    } catch (error) {
      core.setFailed(error.message);
    }
  }
}

new PostReleaseManager().run();
