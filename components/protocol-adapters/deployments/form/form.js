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

export { Form }

class Form {
    constructor(ctr) {
        this.container = ctr;
    }

    draw(pa_id) {
        fetch(active_cmp.constructor.r_api + '/' + pa_id)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving pipelines - ' + response.status;
            })
            .then((data) => {
                fetch('/components/protocol-adapters/deployments/form/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let configs = [];
                        let num = 0;
                        for (const [key, val] of Object.entries(data['configs'])) {
                            configs.push(
                                {
                                    key: key,
                                    value: val,
                                    num: num
                                }
                            )
                            num++;
                        }
                        if (data['ports']) {
                            for (num=0; num < data['ports'].length; num++) {
                                data['ports'][num]['num'] = num;
                            }
                        }
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: pa_id,
                                name: data['name'],
                                image: data['image'],
                                dc_path: data['data_cache_path'],
                                has_configs: !!(configs),
                                configs: configs,
                                has_ports: !!(data['ports']),
                                ports: data['ports']
                            }
                        );
                        let form = this.container.getElementsByTagName('form')[0];
                        form.addEventListener('submit', this.submit)
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    submit(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        let data = {};
        let config_field_keys = [];
        let port_keys = [];
        for (let [key, value] of form.entries()) {
            if (!key.includes('port-') && !key.includes('conf-')) {
                data[key] = (value) ? value : null;
            }
            if (key.includes('conf-')) {
                const num = key.split('-')[1];
                if (!config_field_keys.includes(num)) {
                    config_field_keys.push(num)
                }
            }
            if (key.includes('port-')) {
                const num = key.split('-')[1];
                if (!port_keys.includes(num)) {
                    port_keys.push(num)
                }
            }
        }
        if (config_field_keys.length > 0) {
            data['configs'] = {};
            for (const num of config_field_keys) {
                data['configs'][form.get('conf-' + num + '-key')] = (form.get('conf-' + num + '-value')) ? form.get('conf-' + num + '-value') : null;
            }
        } else {
            data['configs'] = null;
        }
        if (port_keys.length > 0) {
            data['ports'] = {};
            for (const num of port_keys) {
                data['ports'][form.get('port-' + num + '-number') + '/' + form.get('port-' + num + '-protocol')] = {
                    host_interface: (form.get('port-' + num + '-host-interface')) ? form.get('port-' + num + '-host-interface') : null,
                    host_ports: (form.get('port-' + num + '-host-ports').includes(',')) ? active_cmp.form.splitToNumbers(form.get('port-' + num + '-host-ports')) : Number(form.get('port-' + num + '-host-ports'))
                };
            }
        } else {
            data['ports'] = null;
        }
        data['type'] = 'protocol-adapter';
        delete data['name'];
        fetch(active_cmp.constructor.api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (response.ok) {
                    alert('Protocol-Adapter deployed successfully!');
                    window.open('/protocol-adapters/deployments','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((error) => {
                alert("Can't deploy Protocol-Adapter: " + error);
            });
    }

    splitToNumbers(str) {
        str = str.split(',');
        let res = [];
        for (const item of str) {
            res.push(Number(item));
        }
        return res;
    }
}