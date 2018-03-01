# the image to use
FROM node:latest

# maintainer of this dockerfile
LABEL Matthew Kelly (Badgerati)

# update the container
RUN apt-get update -y

# install utils
RUN apt-get install -y vim
RUN apt-get install -y git
RUN npm install -g bower
RUN npm install -g gulp

# install npm modules
RUN npm config set loglevel warn
RUN npm config set ignore-scripts false
