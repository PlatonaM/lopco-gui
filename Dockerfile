FROM alpine

RUN apk add --update --no-cache lighttpd

RUN mkdir -p /var/www/localhost/htdocs /var/log/lighttpd /var/lib/lighttpd

RUN sed -i -r 's#\#    .*mod_rewrite.* *#    "mod_rewrite",#g' /etc/lighttpd/lighttpd.conf
RUN sed -i -r 's#\#    .*mod_proxy.* *#    "mod_proxy",#g' /etc/lighttpd/lighttpd.conf
RUN sed -i -r 's#\#    .*mod_setenv.* *#    "mod_setenv",#g' /etc/lighttpd/lighttpd.conf
RUN sed -i -r 's#\#.*server.event-handler = "linux-sysepoll".*#server.event-handler = "linux-sysepoll"#g' /etc/lighttpd/lighttpd.conf
RUN echo 'url.rewrite = ("^/api/.+"  => "", "^/img.+"  => "", "^/components.+"  => "", "^/js.+"  => "", "^/css.+"  => "", "^[/a-zA-Z0-9._=$;?:@&#-]+$" => "/index.html")' >> /etc/lighttpd/lighttpd.conf
RUN echo '$HTTP["url"] =~ "^/api/.+" { proxy.server  = ( "" => ("" => ( "host" => "127.0.0.1", "port" => 81 ))) }' >> /etc/lighttpd/lighttpd.conf
RUN echo '$SERVER["socket"] == ":81" { url.rewrite-once = ( "^/api/(.*)$" => "/$1" ) proxy.server  = ( "" => ( "" => ( "host" => "reverse-proxy", "port" => 8000 ))) }' >> /etc/lighttpd/lighttpd.conf
RUN echo '$HTTP["url"] =~ "^/.+" { setenv.set-response-header+= ("Cache-Control" => "no-cache, must-revalidate") }' >> /etc/lighttpd/lighttpd.conf

COPY . /var/www/localhost/htdocs/

RUN chown -R lighttpd:lighttpd /var/www/localhost/ && chown -R lighttpd:lighttpd /var/lib/lighttpd && chown -R lighttpd:lighttpd /var/log/lighttpd

EXPOSE 80

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
