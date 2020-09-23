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
    static io_template;

    constructor(ctr) {
        this.container = ctr;
        this.conf_count = 0;
        this.io_count = 0;
    }

    async getTemplates() {
        let response = await fetch('/components/workers/form/conf-fields-template.html')
        Form.conf_template = await response.text();
        response = await fetch('/components/workers/form/io-fields-template.html')
        Form.io_template = await response.text();
        return await fetch('/components/workers/form/template.html');
    }
    
    draw(data= null) {
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
                            description: data['description'],
                            data_cache_path: data['data_cache_path']
                        }
                    );
                    if (data['configs']) {
                        const btn = document.getElementById('add-conf-field-btn');
                        for (const [key, value] of Object.entries(data['configs'])) {
                            this.addConfigFields(btn, { key: key, value: value });
                        }
                    }
                    if (data['input']) {
                        const sel = document.getElementById('form-input-type');
                        sel.value = data['input']['type'];
                        this.toggleIOFields(sel, 'input');
                        const btn = document.getElementById('add-input-field-btn');
                        for (const field of data['input']['fields']) {
                            this.addIOField(btn, 'input', field);
                        }
                    }
                    if (data['output']) {
                        const sel = document.getElementById('form-output-type');
                        sel.value = data['output']['type'];
                        this.toggleIOFields(sel, 'output');
                        const btn = document.getElementById('add-output-field-btn');
                        for (const field of data['output']['fields']) {
                            this.addIOField(btn, 'output', field);
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

    genIO(form, type, keys) {
        let data = {
            type: form.get(type + '-type'),
            fields: []
        };
        for (const num of keys) {
            data['fields'].push(
                {
                    name: form.get(type + '-' + num + '-name'),
                    media_type: form.get(type + '-' + num + '-media_type'),
                    is_file: (form.get(type + '-' + num + '-is_file') === 'true')
                }
            );
        }
        return data;
    }

    submit(event, method='POST') {
        event.preventDefault();
        const form = new FormData(event.target);
        let data = {};
        let config_field_keys = [];
        let input_field_keys = [];
        let output_field_keys = [];
        for (let [key, value] of form.entries()) {
            if (!key.includes('input-') && !key.includes('output-') && !key.includes('conf-')) {
                data[key] = (value) ? value : null;
            }
            if (key.includes('conf-')) {
                const num = key.split('-')[1];
                if (!config_field_keys.includes(num)) {
                    config_field_keys.push(num)
                }
            }
            if (key.includes('input-') && !key.includes('input-type')) {
                const num = key.split('-')[1];
                if (!input_field_keys.includes(num)) {
                    input_field_keys.push(num)
                }
            }
            if (key.includes('output-') && !key.includes('output-type')) {
                const num = key.split('-')[1];
                if (!output_field_keys.includes(num)) {
                    output_field_keys.push(num)
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
        data['input'] = (form.get('input-type') && input_field_keys.length > 0) ? active_cmp.form.genIO(form, 'input', input_field_keys) : null;
        data['output'] = (form.get('output-type') && output_field_keys.length > 0) ? active_cmp.form.genIO(form, 'output', output_field_keys) : null;
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
                    alert('Worker saved successfully!');
                    window.open('/workers','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((error) => {
                alert("Can't save Worker: " + error);
            });
    }

    submitEdit(event) {
        active_cmp.form.submit(event, 'PUT');
    }

    addConfigFields(element, data=null) {
        let parent = element.parentElement;
        if (parent.childElementCount < 2) {
            element.className += " uk-margin-bottom";
        }
        if (data) {
            parent.append(document.createRange().createContextualFragment(Mustache.render(Form.conf_template, {id: active_cmp.form.conf_count, key: data['key'], value: data['value']})));
        } else {
            parent.append(document.createRange().createContextualFragment(Mustache.render(Form.conf_template, {id: active_cmp.form.conf_count})));
        }
        active_cmp.form.conf_count++;
    }

    removeConfigFields(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        if (parent.childElementCount < 2) {
            parent.firstElementChild.className = 'uk-button uk-button-default';
        }
    }

    toggleIOFields(element, type) {
        let parent = element.parentElement;
        if (element.value) {
            if (parent.getElementsByTagName('button').length < 1) {
                let btn = document.createElement('button');
                btn.id = 'add-' + type + '-field-btn'
                btn.className = 'uk-button uk-button-default';
                btn.type = 'button';
                btn.setAttribute('uk-icon', 'plus');
                btn.setAttribute('uk-tooltip', 'title: Add ' + type + ' field; pos: top-left; delay: 500');
                btn.onclick = function (e) { active_cmp.form.addIOField(this, type) };
                parent.append(btn);
            }
        } else {
            while (parent.children.length > 1) {
                const lst_child = parent.lastChild;
                if (lst_child.tagName.toLowerCase() !== 'select') {
                    parent.removeChild(lst_child);
                }
            }
            parent.getElementsByTagName('select')[0].className = 'uk-select uk-width-auto';
        }
    }

    addIOField(element, type, data= null) {
        let parent = element.parentElement;
        if (parent.childElementCount < 3) {
            parent.getElementsByTagName('select')[0].className += " uk-margin-bottom";
            element.className += " uk-margin-bottom";
        }
        if (data) {
            parent.append(document.createRange().createContextualFragment(Mustache.render(Form.io_template, {id: active_cmp.form.io_count, type: type, name: data['name'], media_type: data['media_type'], is_file: data['is_file']})));
        } else {
            parent.append(document.createRange().createContextualFragment(Mustache.render(Form.io_template, {id: active_cmp.form.io_count, type: type, is_file: true})));
        }
        active_cmp.form.io_count++;
    }

    removeIOField(id) {
        let element = document.getElementById(id);
        let parent = element.parentElement;
        parent.removeChild(element);
        if (parent.childElementCount < 3) {
            parent.getElementsByTagName('select')[0].className = 'uk-select uk-width-auto';
            parent.getElementsByTagName('button')[0].className = 'uk-button uk-button-default';
        }
    }
}