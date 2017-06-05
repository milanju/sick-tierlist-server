const path = require('path');
const promisify = require('promisify-node');
const fse = promisify(require('fs-extra'));
const git = require('nodegit');
const rimraf = require('rimraf');
fse.ensureDir = promisify(fse.ensureDir);
const { gitName, gitEmail, gitSshUrl, sshPrivateKeyPath, sshPublicKeyPath } = require('../sshConfig');

/**
 * Commit new TierList to repository.
 */
function deploy(json) {
    const repoUrl = gitSshUrl;
    const commitMessage = 'new tierlist';
    const tmpDir = './sick-tierlist-tmp';

    return gitDeploy(tmpDir, repoUrl, commitMessage, json);
}

function cleanTmpDir(dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, {}, function() {
            resolve();
        });
    });
}

function gitDeploy(tmpDir, repoUrl, commitMessage, json) {
    const signature = git.Signature.now(gitName, gitEmail);

    let repo;
    let index;
    let oid;
    let remote;

    const sshKeyCreds = (url, userName) => {
        return git.Cred.sshKeyNew(
            userName,
            sshPublicKeyPath,
            sshPrivateKeyPath,
            ''
        )
    }

    const sshAgentCreds = (url, userName) => {
        return git.Cred.sshKeyFromAgent(userName);
    }

    const credentialsCallback = sshKeyCreds;

    const cloneOptions = {
        fetchopts: {
            callbacks: {
                credentials: credentialsCallback
            }
        }
    }

    console.log('Git deploy process: started.');
    return cleanTmpDir(tmpDir)
        .then(() => git.Clone(repoUrl, tmpDir, {
            fetchOpts: {
                callbacks: {
                        credentials: credentialsCallback
                    }
                }
            }
        ))
        .then(repository => {
            repo = repository;
            return fse.ensureDir(path.join(repo.workdir()));
        })
        .then(() => fse.writeFile(path.join(repo.workdir(), 'tierlists.json'), JSON.stringify(json)))
        .then(() => repo.refreshIndex())
        .then((indexResult) => {
            index = indexResult;
            return index.addByPath('tierlists.json');
        })
        .then(() => {
            return index.write();
        })
        .then(() => {
            return index.writeTree();
        })
        .then(oidResult => {
            oid = oidResult;
            return git.Reference.nameToId(repo, 'HEAD');
        })
        .then(head => {
            return repo.getCommit(head);
        })
        .then((parent) => {
            return repo.createCommit(
                'HEAD',
                signature,
                signature,
                commitMessage,
                oid,
                [parent]
            );
        })
        .then(() => {
            return git.Remote.lookup(repo, 'origin');
        })
        .then(remoteResult => {
            remote = remoteResult;
            
            return remote.push(
                ['refs/heads/master:refs/heads/master'],
                {
                    callbacks: {
                        credentials: credentialsCallback
                    }
                }
            );
        })
        .then(() => {
            console.log('Git deploy process: done.');
            /**
             * Would love to cleanup the tmp dir here, but rimraf never calls the callback (or deletes the dir).
             * I guess nodegit locks the directory, and I haven't found a way to unlock it (or see any error from rimraf).
             */
            // return cleanTmpDir(tmpDir);
            return Promise.resolve();
        });
}

module.exports = deploy;