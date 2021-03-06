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
    static conf_template;
    static port_template;

    constructor(ctr) {
        this.container = ctr;
        this.conf_count = 0;
        this.port_count = 0;
    }

    async getTemplates() {
        let response = await fetch('/components/protocol-adapters/registry/form/conf-fields-template.html')
        Form.conf_template = await response.text();
        response = await fetch('/components/protocol-adapters/registry/form/port-fields-template.html')
        Form.port_template = await response.text();
        return await fetch('/components/protocol-adapters/registry/form/template.html');
    }

    draw(data) {
        this.getTemplates()
            .then((response) => response.text())
            .then((template) => {
                if (data) {
                    this.container.innerHTML = Mustache.render(
                        template,
                        {
                            id: data['id'],
                            name: data['name'],
                            image: data['image'],
                            dc_path: data['data_cache_path'],
                            description: data['description']
                        }
                    );
                    if (data['configs']) {
                        const btn = document.getElementById('add-conf-field-btn');
                        for (const [key, value] of Object.entries(data['configs'])) {
                            this.addField(btn, 'config', { key: key, value: value });
                        }
                    }
                    if (data['ports']) {
                        const btn = document.getElementById('add-port-field-btn');
                        for (const item of data['ports']) {
                            this.addField(btn, 'port', item);
                        }
                    }
                } else {
                    this.container.innerHTML = Mustache.render(template, {});
                }
                let form = this.container.getElementsByTagName('form')[0];
                if (data) {
                    form.addEventListener('submit', this.submitEdit);
                } else {
                    form.addEventListener('submit', this.submit);
                }
            })
    }

    drawEdit(pa) {
        fetch(active_cmp.constructor.api + '/' + pa)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Protocol-Adapter - ' + response.status;
            })
            .then((data) => {
                data['id'] = pa;
                this.draw(data);
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    submit(event, method='POST') {
        event.preventDefault();
        showSpinner();
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
            data['ports'] = [];
            for (const num of port_keys) {
                data['ports'].push(
                    {
                        port: Number(form.get('port-' + num + '-number')),
                        protocol: form.get('port-' + num + '-protocol')
                    }
                );
            }
        } else {
            data['ports'] = null;
        }
        let url;
        if (method === 'POST') {
            url = active_cmp.constructor.api;
        }
        if (method === 'PUT') {
            url = active_cmp.constructor.api + '/' + data['id'];
            delete data['id'];
        }
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    alert('Protocol-Adapter saved successfully!');
                    window.open('/protocol-adapters','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((error) => {
                alert("Can't save Protocol-Adapter: " + error);
            });
    }

    submitEdit(event) {
        active_cmp.form.submit(event, 'PUT');
    }

    addField(element, type, data=null) {
        let parent = element.parentElement;
        if (parent.childElementCount < 2) {
            element.className += " uk-margin-bottom";
        }
        if (type === 'config') {
            if (data) {
                parent.append(document.createRange().createContextualFragment(Mustache.render(Form.conf_template, {num: this.conf_count, key: data['key'], value: data['value']})));
            } else {
                parent.append(document.createRange().createContextualFragment(Mustache.render(Form.conf_template, {num: this.conf_count})));
            }
            this.conf_count++;
        }
        if (type === 'port') {
            if (data) {
                parent.append(document.createRange().createContextualFragment(
                    Mustache.render(
                        Form.port_template,
                        {
                            num: this.port_count,
                            port: data['port'],
                            tcp: (data['protocol'] === 'tcp'),
                            udp: (data['protocol'] === 'udp'),
                            sctp: (data['protocol'] === 'sctp')
                        }
                        )
                    )
                );
            } else {
                parent.append(document.createRange().createContextualFragment(Mustache.render(Form.port_template, {num: this.port_count})));
            }
            this.port_count++;
        }
    }

    removeField(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        if (parent.childElementCount < 2) {
            parent.firstElementChild.className = 'uk-button uk-button-default';
        }
    }

}
