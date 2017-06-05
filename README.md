# Sick Tierlist Server
This script will fetch various Heroes of the Storm tierlists, merge them together into one file with a common format and commit them to a client repository to be consumed.
The idea is for this script to be used as a cron to keep the client repository up to date.

This is the first prototype of the sick-tierlist-server script.

## How to use
1. You need full access to `git@github.com:milanju/sick-tierlist.git`.
2. An `sshConfig.js` file is required in the project root with paths to your ssh keys. There is an `sshConfig.example.js` for reference.
3. Run `node index.js`

In future we will be able to choose between ssh key paths and using the ssh agent for authentication.
Also specifying the client repository and branch should be configurable (currently hardcoded in `deploy.js`).