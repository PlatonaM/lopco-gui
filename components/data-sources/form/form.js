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

    draw(ds_data= null) {
        fetch(active_cmp.constructor.pr_api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving pipelines - ' + response.status;
            })
            .then((data) => {
                fetch('/components/data-sources/form/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (let [key, value] of Object.entries(data)) {
                            value = JSON.parse(value);
                            items.push(
                                {
                                    p_id: key,
                                    p_name: value['name'],
                                    selected: (ds_data) ? (key === ds_data['pipeline_id']) : false
                                }
                            )
                        }
                        if (ds_data) {
                            this.container.innerHTML = Mustache.render(
                                template,
                                {
                                    pipelines: items,
                                    ds_id: ds_data['id'],
                                    ds_name: ds_data['name'],
                                    ds_type: ds_data['type_id']
                                }
                            );
                        } else {
                            this.container.innerHTML = Mustache.render(template, {pipelines: items});
                        }
                        let form = this.container.getElementsByTagName('form')[0];
                        form.addEventListener('submit', this.submit)
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    drawEdit(ds) {
        fetch(active_cmp.constructor.mr_api + '/' + ds)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Data-Source - ' + response.status;
            })
            .then((data) => {
                data['id'] = ds;
                this.draw(data);
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    submit(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        fetch(active_cmp.constructor.mr_api + '/' + form.get('form-id'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.get('form-name'),
                pipeline_id: form.get('form-pipeline'),
                type_id: form.get('form-type')
            }),
        })
            .then(response => response.text())
            .then((data) => {
                alert('Data-Source saved successfully!');
                window.open('/data-sources','_self');
            })
            .catch((error) => {
                alert("Can't save Data-Source: " + error);
            });
    }
}