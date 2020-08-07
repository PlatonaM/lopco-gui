FROM alpine

RUN apk add --update --no-cache lighttpd

RUN mkdir -p /var/www/localhost/htdocs /var/log/lighttpd /var/lib/lighttpd

RUN sed -i -r 's#\#    .*mod_rewrite.* *#    "mod_rewrite",#g' /etc/lighttpd/lighttpd.conf

RUN sed -i -r 's#\#.*server.event-handler = "linux-sysepoll".*#server.event-handler = "linux-sysepoll"#g' /etc/lighttpd/lighttpd.conf

RUN sed -i -r '/# \{\{\{ mod_rewrite/,/# \}\}\}/c# \{\{\{ mod_rewrite\n url.rewrite = ("^\/components.+"  => "", "^\/js.+"  => "", "^\/css.+"  => "", "^[\/a-zA-Z0-9._=$;?:@&#-]+$" => "/index.html")\n# \}\}\}' /etc/lighttpd/lighttpd.conf

COPY . /var/www/localhost/htdocs/

RUN chown -R lighttpd:lighttpd /var/www/localhost/ && chown -R lighttpd:lighttpd /var/lib/lighttpd && chown -R lighttpd:lighttpd /var/log/lighttpd

EXPOSE 80

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
