FROM lscr.io/linuxserver/calibre:latest  AS build-stage
ENV NODE_VERSION=10.24.1
ENV DEBIAN_FRONTEND noninteractive
RUN ebook-convert --version
RUN sed -i 's/archive.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
  && sed -i 's/security.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
  && apt-get update \
  && apt-get install --force-yes --no-install-recommends wget fonts-wqy-microhei \
  libgl1-mesa-glx  libegl1 libxkbcommon0 libopengl0 -y \
  && apt-get clean

SHELL ["/bin/bash", "-c"]
RUN wget https://mirrors.huaweicloud.com/nodejs/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz
RUN mkdir -p /usr/local/node && tar -zxvf node-v${NODE_VERSION}-linux-x64.tar.gz -C /usr/local/node
ENV PATH="/usr/local/node/node-v${NODE_VERSION}-linux-x64/bin/:${PATH}"

RUN npm config set registry https://mirrors.huaweicloud.com/repository/npm/
RUN npm install gitbook-cli -g
RUN gitbook fetch  3.2.3

RUN useradd -ms /bin/bash gitbook
RUN chown gitbook:gitbook -R /opt

USER gitbook
RUN gitbook current
WORKDIR /opt
COPY . /opt
RUN gitbook pdf .

FROM scratch AS export-stage
COPY --from=build-stage /opt/book.pdf /
