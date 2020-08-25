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

    draw(pa_id) {
        fetch(active_cmp.constructor.r_api + '/' + pa_id)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving pipelines - ' + response.status;
            })
            .then((data) => {
                fetch('/components/protocol-adapters/deployments/form/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let configs = [];
                        let num = 0;
                        for (const [key, val] of Object.entries(data['configs'])) {
                            configs.push(
                                {
                                    key: key,
                                    value: val,
                                    num: num
                                }
                            )
                            num++;
                        }
                        if (data['ports']) {
                            for (num=0; num < data['ports'].length; num++) {
                                data['ports'][num]['num'] = num;
                            }
                        }
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: pa_id,
                                name: data['name'],
                                image: data['image'],
                                dc_path: data['data_cache_path'],
                                has_configs: !!(configs),
                                configs: configs,
                                has_ports: !!(data['ports']),
                                ports: data['ports']
                            }
                        );
                        let form = this.container.getElementsByTagName('form')[0];
                        form.addEventListener('submit', this.submit)
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err;
            });
    }
}