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
    static stage_template;

    constructor(ctr) {
        this.container = ctr;
        this.stage_container = null;
    }

    async getTemplates() {
        let response = await fetch('/components/pipelines/form/stage-template.html')
        Form.stage_template = await response.text();
        return await fetch('/components/pipelines/form/template.html');
    }

    draw(pl_data= null) {
        fetch(active_cmp.constructor.w_api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Workers - ' + response.status;
            })
            .then((data) => {
                this.getTemplates()
                    .then((response) => response.text())
                    .then((template) => {
                        let workers = [];
                        for (let [key, value] of Object.entries(data)) {
                            value = JSON.parse(value);
                            workers.push(
                                {
                                    w_id: key,
                                    w_name: value['name'],
                                    w_data: value
                                }
                            )
                        }
                        if (pl_data) {
                            this.container.innerHTML = Mustache.render(
                                template,
                                {
                                    workers: workers,
                                    id: pl_data['id'],
                                    name: pl_data['name'],
                                    stages: pl_data['stages']
                                }
                            );
                        } else {
                            this.container.innerHTML = Mustache.render(template, {workers: workers});
                        }
                        let form = this.container.getElementsByTagName('form')[0];
                        form.addEventListener('submit', this.submit);
                        this.stage_container = document.getElementById('stages');
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }

    drawEdit(pl) {
        fetch(active_cmp.constructor.api + '/' + pl)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Pipeline - ' + response.status;
            })
            .then((data) => {
                data['id'] = pl;
                this.draw(data);
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }
}