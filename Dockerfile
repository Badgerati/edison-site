# the image to use
FROM edison/node-base:latest

# maintainer of this dockerfile
LABEL Matthew Kelly (Badgerati)

# create and copy source to the app directory
RUN mkdir -p /usr/src/app
COPY . /usr/src/app

# set the working directory to the app directory
WORKDIR /usr/src/app

# install npm modules
RUN npm install --quiet

# install frontend libraries
RUN bower install
RUN gulp

# expose the main port for node
EXPOSE 8082

# start the app
CMD ["npm", "start"]
