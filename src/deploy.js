const path = require('path');
const promisify = require('promisify-node');
const fse = promisify(require('fs-extra'));
const git = require('nodegit');
const rimraf = require('rimraf');
fse.ensureDir = promisify(fse.ensureDir);
const { gitName, gitEmail, sshPrivateKeyPath, sshPublicKeyPath } = require('../sshConfig');

/**
 * Commit new TierList to repository.
 */
function deploy(json) {
    const cleanupPromise = new Promise((resolve, reject) => {
        rimraf('./tmp', resolve);
    });

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
    return cleanupPromise
        .then(() => git.Clone('git@github.com:milanju/sick-tierlist.git', './tmp', {
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
                'new tierlist',
                oid,
                [parent]
            );
        })
        .then(() => {
            return git.Remote.lookup(repo, 'origin');
        })
        .then(remoteResult => {
            remote = remoteResult;
            console.log(remote);
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
        });
}

module.exports = deploy;