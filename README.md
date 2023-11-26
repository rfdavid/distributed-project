# Distributed Systems Project

## Using docker

```
$ docker build -t distributed-inference .
$ docker run -p 3000:3000 distributed-inference 

```


## Without docker

```bash
$ npm run dev
```

If you are experiencing the following error:

```
Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:69:19)
    ...
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}
```

Try the following before running:
```bash
$ export NODE_OPTIONS=--openssl-legacy-provider
```

