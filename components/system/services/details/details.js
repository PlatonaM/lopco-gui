/*
    Copyright 2020 InfAI (CC SES)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

export { Details }


class Details {
    constructor(ctr) {
        this.container = ctr;
    }

    draw(srv) {
        fetch(active_cmp.constructor.api + '/' + srv)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Protocol-Adapter - ' + response.status;
            })
            .then((data) => {
                fetch('/components/system/details/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let ports = [];
                        if (data['ports']) {
                            const entries = Object.entries(data['ports']);
                            let e_length = entries.length;
                            for (let [port, host] of entries) {
                                ports.push(
                                    {
                                        port: port,
                                        host_i: (host) ? host['host_interface'] : 'null',
                                        host_p: (host) ? (e_length > 1) ? host['host_ports'].toString()+'; ' : host['host_ports'].toString() : 'null'
                                    }
                                );
                                e_length--;

                            }
                        }
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                name: srv,
                                image: data['image']['name'],
                                hash: data['image']['hash'],
                                status: data['status'],
                                ports: ports,
                                type: data['labels']['lopco-type']
                            }
                        );
                        let log_container = document.getElementById('log-ctr');
                        this.getLog(srv, log_container, true);
                        window.setInterval(this.getLog, 5000, srv, log_container);
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }

    getLog(srv, log_ctr, init=false) {
        fetch(active_cmp.constructor.api + '/' + srv + '/log?lines=100')
            .then((response) => {
                if (response.ok) {
                    return response.text()
                }
                throw 'Error retrieving log - ' + response.status;
            })
            .then((data) => {
                log_ctr.innerHTML = data;
                if (init) {
                    log_ctr.scrollTop = log_ctr.scrollHeight;
                }
                if (log_ctr.scrollTop + log_ctr.offsetHeight >= log_ctr.scrollHeight) {
                    log_ctr.scrollTop = log_ctr.scrollHeight;
                }
            })
            .catch((err) => {
                log_ctr.innerHTML = err;
            });
    }
}