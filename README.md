# web-EtherQL

A simple webview for ethereum depending on [geth](https://github.com/ethereum/go-ethereum) and mongodb.

## Sync Blockchain Data

```
$ geth --rpc --fast
```

## Start Mongodb

Run a mongod process as a daemon.

## Check Configuration

```
$ cat etherql.cfg.json 
```

```
{
    "mongo": "mongodb://localhost/ethereum",
    "gethHost": "localhost",
    "gethPort": 8545
}
```

## Start Web Server

```
$ npm install
$ npm run start
```
