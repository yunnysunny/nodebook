FROM yunnysunny/gitbook:latest  AS build-stage
RUN npm install svgexport -g
WORKDIR /opt
COPY . /opt
RUN gitbook pdf .

FROM scratch AS export-stage
COPY --from=build-stage /opt/book.pdf /
