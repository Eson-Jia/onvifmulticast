docker run --network host -it -d -v `pwd`:/udpclient --name udpclient node:8.9.3-alpine node /udpclient/client.js
