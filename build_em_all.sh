cp .npmrc.template $HOME/.npmrc

ng build mn-geo && cd dist/mn-geo && npm publish && cd ../..
ng build mn-map && cd dist/mn-map && npm publish && cd ../..
ng build mn-mapgl && cd dist/mn-mapgl && npm publish && cd ../..


