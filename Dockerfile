FROM ubuntu:20.04  AS build-stage
ENV NODE_VERSION=10.24.1
COPY docker/etc /etc

RUN apt-get update

RUN apt-get install -y wget
SHELL ["/bin/bash", "-c"]
RUN wget https://mirrors.huaweicloud.com/nodejs/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz
RUN mkdir -p /usr/local/node && tar -zxvf node-v${NODE_VERSION}-linux-x64.tar.gz -C /usr/local/node
ENV PATH="/usr/local/node/node-v${NODE_VERSION}-linux-x64/bin/:${PATH}"

RUN npm config set registry https://mirrors.huaweicloud.com/repository/npm/
RUN npm install gitbook-cli -g
RUN gitbook fetch  3.2.3

ENV DEBIAN_FRONTEND noninteractive
# 官网给的安装依赖说明 https://calibre-ebook.com/download_linux
RUN apt-get install python xdg-utils xz-utils -yq
RUN wget --no-check-certificate -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin
RUN ebook-convert --version
# 官网未提及的依赖
RUN apt-get install libnss3 libxdamage1 -y
# 中文字体
RUN apt-get install -y --force-yes --no-install-recommends fonts-wqy-microhei
RUN useradd -ms /bin/bash gitbook
RUN chown gitbook:gitbook -R /opt
# RUN npm install gitbook -g

USER gitbook
RUN gitbook current
WORKDIR /opt
COPY . /opt
RUN gitbook pdf .

FROM scratch AS export-stage
COPY --from=build-stage /opt/book.pdf /
