FROM node

COPY package.json .bowerrc bower.json ./
RUN npm install \
    && ./node_modules/.bin/bower install --allow-root \
    && npm cache clean
COPY . .

CMD sh -c 'cp config/docker.js config/local.js && npm start'
