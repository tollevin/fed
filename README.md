# fed

# install mongodb
# install meteor

# start instructions
```
yarn install

# starts at port 3003
meteor --port 3003
```

# troubleshooting meteor

Removed home directory .meteor
```
rm -rf ~/.meteor
```

# run linter

```
yarn run lint

# run with attempted code editing
yarn run lint-fix
```

# install vscode for in editor debugging

follow the instructions here:

https://github.com/Microsoft/vscode-recipes/tree/master/meteor

no need to configure VS code, it's already configured in the repo (for port 3003).
- Start meteor `meteor --port 3003`
- then start debugger in chrome mode