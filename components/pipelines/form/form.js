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

    submit(event, method='POST') {
        event.preventDefault();
        const form = new FormData(event.target);
        let i;
        for (i=0; i < Object.keys(active_cmp.form.stages).length; i++) {
            active_cmp.form.stages[String(i)]['worker'] = { ...active_cmp.form.workers[active_cmp.form.stages[String(i)]['wk_id']] };
            active_cmp.form.stages[String(i)]['worker']['id'] = active_cmp.form.stages[String(i)]['wk_id'];
            delete active_cmp.form.stages[String(i)]['wk_id'];
            active_cmp.form.stages[String(i)]['description'] = form.get(active_cmp.form.stages[String(i)]['id'] + '-description');
            active_cmp.form.stages[String(i)]['input_map'] = {};
            for (let [key, value] of form.entries()) {
                if (key.includes(active_cmp.form.stages[String(i)]['id']+'-input-key')) {
                    active_cmp.form.stages[String(i)]['input_map'][value] = form.get(active_cmp.form.stages[String(i)]['id']+'-input-value-'+key.split('-')[3]);
                }
                if (key.includes(active_cmp.form.stages[String(i)]['id']+'-config-key')) {
                    active_cmp.form.stages[String(i)]['worker']['configs'][value] = form.get(active_cmp.form.stages[String(i)]['id']+'-config-value-'+key.split('-')[3]);
                }
            }
            delete active_cmp.form.stages[String(i)]['id'];
        }
        let url;
        if (method === 'POST') {
            url = active_cmp.constructor.api;
        }
        if (method === 'PUT') {
            url = active_cmp.constructor.api + '/' + form.get('id');
        }
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'name': form.get('name'),
                'stages': active_cmp.form.stages
            })
        })
            .then(response => {
                if (response.ok) {
                    alert('Pipeline saved successfully!');
                    window.open('/pipelines','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((error) => {
                alert("Can't save Pipeline: " + error);
            });
    }

    submitEdit(event) {
        active_cmp.form.submit(event, 'PUT');
    }

    genRandomID() {
        let array = new Uint32Array(2);
        window.crypto.getRandomValues(array);
        return array.join('') + String(performance.now()).replace('.', '');
    }

    addStage(wk_id, data=null) {
        const st_num = Object.keys(active_cmp.form.stages).length;
        let inputs = [];
        let i_num = 0;
        if (active_cmp.form.workers[wk_id]['input']) {
            for (let item of active_cmp.form.workers[wk_id]['input']['fields']) {
                let values = [];
                if (st_num === 0) {
                    values.push(
                        {
                            name: 'init_source',
                            selected: (data) ? (Object.keys(data['input_map']).includes(item['name'])) ? (data['input_map'][item['name']] === 'init_source') : null : null
                        }
                    )
                } else {
                    if (active_cmp.form.workers[active_cmp.form.stages[String(st_num - 1)]['wk_id']]['output']) {
                        for (let o_item of active_cmp.form.workers[active_cmp.form.stages[String(st_num - 1)]['wk_id']]['output']['fields']) {
                            values.push({
                                ...o_item,
                                selected: (data) ? (Object.keys(data['input_map']).includes(item['name'])) ? (data['input_map'][item['name']] === o_item['name']) : null : null
                            });
                        }
                    }
                }
                inputs.push(
                    {
                        name: item['name'],
                        media_type: item['media_type'],
                        is_file: item['is_file'],
                        i_num: i_num,
                        values: values
                    }
                );
                i_num++;
            }
        }
        let configs = [];
        let c_num = 0;
        if (active_cmp.form.workers[wk_id]['configs']) {
            for (let [key, value] of Object.entries(active_cmp.form.workers[wk_id]['configs'])) {
                configs.push(
                    {
                        key: key,
                        value: (data) ? (Object.keys(data['worker']['configs']).includes(key)) ? data['worker']['configs'][key] : value : value,
                        c_num: c_num
                    }
                )
                c_num++;
            }
        }
        const st_id = active_cmp.form.genRandomID();
        active_cmp.form.stage_container.append(document.createRange().createContextualFragment(Mustache.render(Form.stage_template, {
            id: st_id,
            number: st_num,
            description: (data) ? data['description'] : null,
            w_name: active_cmp.form.workers[wk_id]['name'],
            w_id: wk_id,
            input: inputs,
            output: (active_cmp.form.workers[wk_id]['output']) ? active_cmp.form.workers[wk_id]['output']['fields'] : null,
            has_configs: !!(active_cmp.form.workers[wk_id]['configs']),
            configs: configs,
            i_type: active_cmp.form.workers[wk_id]['input']['type'],
            o_type: (active_cmp.form.workers[wk_id]['output']) ? active_cmp.form.workers[wk_id]['output']['type'] : 'null'
        })));
        active_cmp.form.stages[String(st_num)] = { id: st_id, wk_id: wk_id };
    }

    removeStage(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        let st_num;
        for (let [key, value] of Object.entries(active_cmp.form.stages)) {
            if (value['id'] === id) {
                st_num = Number(key);
                break;
            }
        }
        if (st_num !== Object.keys(active_cmp.form.stages).length - 1) {
            let i;
            for (i=st_num; i < Object.keys(active_cmp.form.stages).length - 1; i++) {
                active_cmp.form.stages[String(i)] = active_cmp.form.stages[String(i + 1)];
            }
        }
        delete active_cmp.form.stages[String(Object.keys(active_cmp.form.stages).length - 1)]
        if ((Object.keys(active_cmp.form.stages).length > 0) && (st_num !== Object.keys(active_cmp.form.stages).length)) {
            if (st_num === 0) {
                active_cmp.form.repopulateInputs(st_num, [ {name: 'init_source'} ]);
            } else {
                if (active_cmp.form.workers[active_cmp.form.stages[String(st_num - 1)]['wk_id']]['output']) {
                    active_cmp.form.repopulateInputs(st_num, active_cmp.form.workers[active_cmp.form.stages[String(st_num - 1)]['wk_id']]['output']['fields']);
                }
            }
        }
        for (let [key, value] of Object.entries(active_cmp.form.stages)) {
            let num_e = document.getElementById(value['id'] + '-number');
            num_e.value = key;
        }
    }

    repopulateInputs(st_num, fields) {
        let i;
        for (i=0; i < active_cmp.form.workers[active_cmp.form.stages[String(st_num)]['wk_id']]['input']['fields'].length; i++) {
            let in_elm = document.getElementById(active_cmp.form.stages[String(st_num)]['id'] + '-input-value-' + i);
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