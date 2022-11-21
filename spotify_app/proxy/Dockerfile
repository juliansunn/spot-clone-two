# FROM nginxinc/nginxinc/nginx-unprivileged:1-alpine
FROM nginx
LABEL maintainer="juliansunn@gmail.com"

COPY ./default.conf.tpl /etc/nginx/default.conf.tpl
COPY ./uwsgi_params /etc/nginx/uwsgi_params
COPY ./run.sh /run.sh

ENV LISTEN_PORT=8000
ENV APP_HOST=sp_service
ENV APP_PORT=9000

USER root

RUN touch /etc/nginx/conf.d/default.conf && \
    chown nginx:nginx /etc/nginx/conf.d/default.conf && \
    chmod +x /run.sh

USER nginxinc

CMD ["/run.sh"]
