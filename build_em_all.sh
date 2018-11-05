#! /bin/env /bin/bash
cp .npmrc.template $HOME/.npmrc

# npm run compodoc

ng build mn-geo                      #&& cd dist/mn-geo               && npm publish --access public && cd ../..

ng build mn-geo-datasources --prod   #&& cd dist/mn-datasources       && npm publish --access public && cd ../..
ng build mn-geo-datasources-csv --prod   #&& cd dist/mn-datasources       && npm publish --access public && cd ../..

ng build mn-geo-layers --prod        #&& cd dist/mn-geo-layers            && npm publish --access public && cd ../..
ng build mn-geo-layers-osm --prod    #&& cd dist/mn-geo-layers-osm    && npm publish --access public && cd ../..
ng build mn-geo-layers-stamen --prod #&& cd dist/mn-geo-layers-stamen && npm publish --access public && cd ../..
ng build mn-geo-layers-c3d --prod #&& cd dist/mn-geo-layers-stamen && npm publish --access public && cd ../..
ng build mn-geo-layers-carto --prod #&& cd dist/mn-geo-layers-stamen && npm publish --access public && cd ../..
#ng build mn-geo-layers-ohm --prod #&& cd dist/mn-geo-layers-stamen && npm publish --access public && cd ../..
ng build mn-geo-flavours --prod   #&& cd dist/mn-datasources       && npm publish --access public && cd ../..

ng build mn-geo-modes --prod   #&& cd dist/mn-datasources       && npm publish --access public && cd ../..

ng build mn-geo-transformers --prod   #&& cd dist/mn-datasources       && npm publish --access public && cd ../..

ng build mn-map --prod               #&& cd dist/mn-map               && npm publish --access public && cd ../..
ng build mn-mapgl --prod             #&& cd dist/mn-mapgl             && npm publish --access public && cd ../..
ng build chcx-static --prod          #&& cd dist/chcx-static          && npm publish --access public && cd ../..
ng build gcx-core --prod             #&& cd dist/gcx-core             && npm publish --access public && cd ../..
#ng build ohm-core --prod             && cd dist/ohm-core             && npm publish --access public && cd ../..

ng build --prod

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker build -t modalnodes/geocontext-front -f Dockerfile.geocontext-front
docker push modalnodes/geocontext-front

#echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
#docker build -t modalnodes/geocontext-front:0.1.rc$TRAVIS_BUILD_NUMBER .
#docker push modalnodes/geocontext-front:0.1.rc$TRAVIS_BUILD_NUMBER
#echo "modalnodes/geocontext-front:0.1.rc$TRAVIS_BUILD_NUMBER"
