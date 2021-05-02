 # Lead-Fetcher
 This tool is meant to find 0-days in open source packages. The engine uses the open source AST SAST tool named [Semgrep](https://semgrep.dev/).
 The backend is written in python (flask API) and the frontend with React (I used ant design for most of the components).
 ## supported repositories
 Currently the supported repositories are:
  - NPM
 ## Installation
Clone the repo to a local folder and run `docker compose up`, 
this will run the backend API server in a docker on port `5000` and the frontend on port `3000`.
The whole backend folder is mounted to the docker so adding/removing rules will have a direct effect.

To run the frontend for development: run the following commands from the frontend/ folder:
```
npm install 
npm start
```

## Rules
The rules are stored in `backend/semgrep_rules`.
To read more about rules feel free to read on the [Rules syntax](https://semgrep.dev/docs/writing-rules/rule-syntax/)
Links:
[Rules playground](https://semgrep.dev/editor)
[Community rules](https://semgrep.dev/explore)
[semgrep-rules Repository](https://github.com/returntocorp/semgrep-rules)
