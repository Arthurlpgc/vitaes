# Vitaes

![api](https://github.com/NeverDefineUs/vitaes/workflows/api/badge.svg)
![gravitaesql](https://github.com/NeverDefineUs/vitaes/workflows/gravitaesql/badge.svg)
![logger](https://github.com/NeverDefineUs/vitaes/workflows/logger/badge.svg)
![renderer](https://github.com/NeverDefineUs/vitaes/workflows/renderer/badge.svg)
![storage](https://github.com/NeverDefineUs/vitaes/workflows/storage/badge.svg)
![webapp](https://github.com/NeverDefineUs/vitaes/workflows/webapp/badge.svg)

## The Project
Vitaes is an open source tool with the purpose of making the curriculum creation process easier.
It uses an abstract tree to model the curriculum and compiles it in a PDF.

## Requirements
To work with this project you will need:
- docker-compose
- python3 (used to run scripts and possibly renderer)
- node/npm (optional. Get it to run webapp without docker)
- golang (optional. Get it if you plan to make big changes on any of the golang services. Used v1.12.4)

##### Production only requirements
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [kubectl-aliases](https://github.com/ahmetb/kubectl-aliases) (**PLEASE READ CAREFULY**)
- [linkerd](https://linkerd.io/2/getting-started/)
- [doctl](https://github.com/digitalocean/doctl)

## Running the project

Following scripts available (on project root):
- `python scripts/init.py` (first time on environment only)
- `python scripts/build.py`
- `python scripts/push.py` (production only)
- `python scripts/start.py`

To stop, run `python scripts/kill.py`

You can choose the environment to run the script by adding `--prod`(`-p`) or `--staging`(`-s`) to the command. (defaults to development without any options)

You should be using python 3.

### Development

In the development flow, you should only run the init script once and them start and kill. There's no need to run the build script in development, since start will build when necessary. (will build everything on first run)

After running start script, all containers will be running. (it might take up to a minute for full start)
Run `docker ps` to see information from the containers.

When the containers are running, access the app through your browser at `http://localhost/`.

## Contributing
You can fork and make a pull request at anytime, fixing an issue or adding a feature you think would be useful.

## Releases
Releases are made in random times, the server is currently running on [vitaes.io](https://vitaes.io/) and can be updated by any of the 2 contributors 

## Notes
In order to enable hot reloading for the webapp while developing in Windows, you need to change the `vitaes-webapp/package.json` start script to `CHOKIDAR_USEPOLLING=true react-scripts start`.
