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

export { Details }


class Details {
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

    draw(pa_id) {
        fetch(active_cmp.constructor.api + '/' + pa_id)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Protocol-Adapter - ' + response.status;
            })
            .then((data) => {
                fetch('/components/protocol-adapters/registry/details/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: pa_id,
                                name: data['name'],
                                image: data['image'],
                                description: data['description'],
                                data_cache_path: data['data_cache_path'],
                                conf_section: !!(data['configs']),
                                configs: this.genConfigs(data['configs']),
                                port_section: !!(data['ports']),
                                ports: data['ports']
                            }
                        );
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }
}
