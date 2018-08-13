#cp .npmrc.template $HOME/.npmrc

ng build mn-geo   #&& cd dist/mn-geo   && npm publish --access public && cd ../..
ng build mn-geo-layers   #&& cd dist/mn-geo   && npm publish --access public && cd ../..
ng build mn-geo-layers-osm   #&& cd dist/mn-geo   && npm publish --access public && cd ../..
ng build mn-map   #&& cd dist/mn-map   && npm publish --access public && cd ../..
ng build mn-mapgl #&& cd dist/mn-mapgl && npm publish --access public && cd ../..
ng build gcx-core #&& cd dist/gcx-core && npm publish --access public && cd ../..
ng build ohm-core #&& cd dist/ohm-core && npm publish --access public && cd ../..


