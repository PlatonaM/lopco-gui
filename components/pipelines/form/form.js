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
        this.stages = {};
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
                        if (pl_data) {
                            form.addEventListener('submit', this.submitEdit);
                        } else {
                            form.addEventListener('submit', this.submit);
                        }
                        this.stage_container = document.getElementById('stages');
                        if (pl_data) {
                            let i;
                            for (i=0; i < Object.keys(pl_data['stages']).length; i++) {
                                this.addStage(pl_data['stages'][i]['worker']['id'], pl_data['stages'][i]);
                            }
                        }
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

    genRandomID() {
        let array = new Uint32Array(2);
        window.crypto.getRandomValues(array);
        return array.join('') + String(performance.now()).replace('.', '');
    }

    addStage(wk_id, data=null) {
        const st_num = Object.keys(this.stages).length;
        let inputs = [];
        let i_num = 0;
        if (this.workers[wk_id]['input']) {
            for (let item of this.workers[wk_id]['input']['fields']) {
                inputs.push(
                    {
                        name: item['name'],
                        media_type: item['media_type'],
                        is_file: item['is_file'],
                        i_num: i_num
                    }
                );
                i_num++;
            }
        }
        let i_values = [];
        if (st_num === 0) {
            i_values.push(
                {
                    name: 'init_source'
                }
            )
        } else {
            if (this.workers[this.stages[st_num - 1]['wk_id']]['output']) {
                for (let item of this.workers[this.stages[st_num - 1]['wk_id']]['output']['fields']) {
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
        const st_id = this.genRandomID();
        this.stage_container.append(document.createRange().createContextualFragment(Mustache.render(Form.stage_template, {
            id: st_id,
            number: st_num,
            w_name: this.workers[wk_id]['name'],
            w_id: wk_id,
            input: inputs,
            values: i_values,
            output: (this.workers[wk_id]['output']) ? this.workers[wk_id]['output']['fields'] : null,
            has_configs: !!(this.workers[wk_id]['configs']),
            configs: configs
        })));
        this.stages[st_num] = { id: st_id, wk_id: wk_id };
    }

    removeStage(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        let st_num;
        for (let [key, value] of Object.entries(this.stages)) {
            if (value['id'] === id) {
                st_num = Number(key);
                break;
            }
        }
        if (st_num !== Object.keys(this.stages).length - 1) {
            let i;
            for (i=st_num; i < Object.keys(this.stages).length - 1; i++) {
                this.stages[i] = this.stages[i + 1];
            }
        }
        delete this.stages[Object.keys(this.stages).length - 1]
        if ((Object.keys(this.stages).length > 0) && (st_num !== Object.keys(this.stages).length)) {
            if (st_num === 0) {
                this.repopulateInputs(st_num, [ {name: 'init_source'} ]);
            } else {
                if (this.workers[this.stages[st_num - 1]['wk_id']]['output']) {
                    this.repopulateInputs(st_num, this.workers[this.stages[st_num - 1]['wk_id']]['output']['fields']);
                }
            }
        }
        for (let [key, value] of Object.entries(this.stages)) {
            let num_e = document.getElementById(value['id'] + '-number');
            num_e.value = key;
        }
    }

    repopulateInputs(st_num, fields) {
        let i;
        for (i=0; i < this.workers[this.stages[st_num]['wk_id']]['input']['fields'].length; i++) {
            let in_elm = document.getElementById(this.stages[st_num]['id'] + '-input-' + i + '-value');
            while (in_elm.options.length > 1) {
                in_elm.options.remove(in_elm.options.length - 1);
            }
            for (let item of fields) {
                let in_opt = document.createElement('option')
                in_opt.value = item['name'];
                in_opt.text = item['name'];
                in_elm.add(in_opt);
            }
        }
    }
}