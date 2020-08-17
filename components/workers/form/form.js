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

    genConfigs(items) {
        let configs = [];
        if (items) {
            for (const [key, value] of Object.entries(items)) {
                configs.push(
                    {
                        conf_key: key,
                        conf_value: (value) ? value : 'null'
                    }
                )
            }
        }
        return configs;
    }

    draw(data= null) {
        fetch('/components/workers/form/template.html')
            .then((response) => response.text())
            .then((template) => {
                if (data) {
                    this.container.innerHTML = Mustache.render(
                        template,
                        {
                            id: data['id'],
                            name: data['name'],
                            image: data['image'],
                            description: data['description'],
                            data_cache_path: data['data_cache_path'],
                            conf_section: (data['configs']),
                            configs: this.genConfigs(data['configs']),
                            i_type: (data['input']) ? data['input']['type'] : null,
                            o_type: (data['output']) ? data['output']['type'] : null,
                            i_fields: (data['input']) ? data['input']['fields'] : null,
                            o_fields: (data['output']) ? data['output']['fields'] : null
                        }
                    );
                } else {
                    this.container.innerHTML = Mustache.render(template, {});
                }
                let form = this.container.getElementsByTagName('form')[0];
                form.addEventListener('submit', this.submit)
            });
    }

    drawEdit(wk) {
        fetch(active_cmp.constructor.api + '/' + wk)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Worker - ' + response.status;
            })
            .then((data) => {
                data['id'] = wk;
                this.draw(data);
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    submit(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        fetch(active_cmp.constructor.api + '/' + form.get('form-id'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.get('form-name'),
                pipeline_id: form.get('form-pipeline'),
                type_id: form.get('form-type')
            }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Data-Source saved successfully!');
                    window.open('/data-sources','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((error) => {
                alert("Can't save Data-Source: " + error);
            });
    }
}