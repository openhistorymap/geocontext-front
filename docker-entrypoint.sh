#!/bin/sh

apk update
apk add jq
echo '' > ./assets/env.json
jq -n env >> ./assets/env.json
apk del jq
rm -rf /var/cache/apk/*
nginx -g "daemon off;"
