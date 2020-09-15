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
        this.workers = {};
        this.st_count = 0;
        this.st_order = [];
        this.st_map = {};
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
                                    w_name: value['name']
                                }
                            )
                            this.workers[key] = value;
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
                        this.addInitStage();
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

    addInitStage() {
        this.stage_container.append(document.createRange().createContextualFragment(Mustache.render(Form.stage_template, {
            init: true,
            name: 'init',
            num: this.st_count,
            output: [{name: 'init_source', media_type: '', is_file: true}]
        })));
        this.st_map[this.st_count] = 'init';
        this.st_order.push(this.st_count)
        this.st_count++;
    }

    addStage(wk_id) {
        let inputs = [];
        let i_num = 0;
        if (this.workers[wk_id]['input']) {
            for (let item of this.workers[wk_id]['input']['fields']) {
                item['i_num'] = i_num;
                inputs.push(item);
                i_num++;
            }
        }
        let i_values = [];
        if (this.st_map[this.st_order[this.st_order.length - 1]] === 'init') {
            i_values.push(
                {
                    name: 'init_source'
                }
            )
        } else {
            if (this.workers[this.st_map[this.st_order[this.st_order.length - 1]]]['output']) {
                for (let item of this.workers[this.st_map[this.st_order[this.st_order.length - 1]]]['output']['fields']) {
                    i_values.push(item);
                }
            }
        }
        let configs = [];
        let c_num = 0;
        if (this.workers[wk_id]['configs']) {
            for (let [key, value] of Object.entries(this.workers[wk_id]['configs'])) {
                configs.push(
                    {
                        key: key,
                        value: value,
                        c_num: c_num
                    }
                )
                c_num++;
            }
        }
        this.stage_container.append(document.createRange().createContextualFragment(Mustache.render(Form.stage_template, {
            num: this.st_count,
            w_name: this.workers[wk_id]['name'],
            w_id: wk_id,
            input: inputs,
            values: i_values,
            output: (this.workers[wk_id]['output']) ? this.workers[wk_id]['output']['fields'] : null,
            has_configs: !!(this.workers[wk_id]['configs']),
            configs: configs
        })));
        this.st_map[this.st_count] = wk_id;
        this.st_order.push(this.st_count)
        this.st_count++;
    }

    removeStage(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        delete this.st_map[id];
        this.st_order = this.st_order.splice(this.st_order.indexOf(id), 1);
    }
}