# the image to use
FROM node:argon

# maintainer of this dockerfile
MAINTAINER Matthew Kelly (Badgerati)

# create and copy source to the app directory
RUN mkdir -p /usr/src/app
COPY . /usr/src/app

# set the working directory to the app directory
WORKDIR /usr/src/app

# install npm modules
RUN npm config set loglevel warn
RUN npm config set ignore-scripts false
RUN npm install

# expose the main port for node
EXPOSE 8082

# start the app
CMD ["npm", "start"]
