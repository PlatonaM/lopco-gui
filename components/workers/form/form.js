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
        fetch('/components/workers/form/conf-fields-template.html')
            .then((response) => response.text())
            .then((template) => {
                Form.conf_template = template;
            });
        fetch('/components/workers/form/io-fields-template.html')
            .then((response) => response.text())
            .then((template) => {
                Form.io_template = template;
            });
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

    submit(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        let data = {};
        let config_field_keys = [];
        let input_field_keys = [];
        let output_field_keys = [];
        for (let [key, value] of form.entries()) {
            if (!key.includes('input-') && !key.includes('output-') && !key.includes('conf-')) {
                data[key] = value;
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
        fetch(active_cmp.constructor.api, {
            method: 'POST',
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

    addConfigFields(element) {
        let parent = element.parentElement;
        if (parent.childElementCount < 2) {
            element.className += " uk-margin-bottom";
        }
        parent.append(document.createRange().createContextualFragment(Mustache.render(Form.conf_template, {id: this.conf_count})));
        this.conf_count++;
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

    addIOField(element, type) {
        let parent = element.parentElement;
        if (parent.childElementCount < 3) {
            parent.getElementsByTagName('select')[0].className += " uk-margin-bottom";
            element.className += " uk-margin-bottom";
        }
        parent.append(document.createRange().createContextualFragment(Mustache.render(Form.io_template, {id: this.io_count, type: type})));
        this.io_count++;
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