# web-EtherQL

A simple webview for ethereum depending on [geth](https://github.com/ethereum/go-ethereum) and mongodb.

## Docker

```
$ docker-compose up
```

## Common Way

### 1. Sync blockchain data

```
$ geth --rpc
```

### 2. Start Mongodb

Run a mongod process as a daemon.

### 3. Check Configuration

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

### 4. Start Web Server

```
$ npm install
$ npm run start
```
