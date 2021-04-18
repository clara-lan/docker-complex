FROM node:14.14.0-alpine
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY ./ ./
#cmd script is setup in package.json
# see server/package.json line 12
CMD ["npm", "run", "start"] 