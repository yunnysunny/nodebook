FROM circleci/node:10.24-buster

RUN npm install cnpm -g --registry=https://registry.npmmirror.com
RUN cnpm install gitbook-cli -g
RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN tar -zxvf phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /usr/local/phantomjs
ENV PATH $PATH:/usr/local/phantomjs
RUN cnpm install gitbook-pdf -g
WORKDIR /opt
COPY . /opt
RUN gitbook pdf .
