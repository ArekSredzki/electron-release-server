FROM node

COPY package.json package.json
RUN npm install && npm cache clean
COPY . .

CMD sh -c 'cp config/docker.js config/local.js && npm start'
