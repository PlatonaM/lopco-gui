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

export { List }

class List {

    static type_map = {
        'worker': '/workers',
        'protocol-adapter': '/protocol-adapters/registry'
    }

    constructor(ctr) {
        this.container = ctr;
    }

    draw() {
        fetch(active_cmp.constructor.api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving updatable items - ' + response.status;
            })
            .then((data) => {
                fetch('/components/system/updates/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (let [key, value] of Object.entries(data)) {
                            let entities = [];
                            if (value['entities']) {
                                for (let [k, v] of Object.entries(value['entities'])) {
                                    entities.push(
                                        {
                                            e_id: k,
                                            e_api: List.type_map[value['type']],
                                            e_name: v['name']
                                        }
                                    )
                                }
                            }
                            if (value['type'] === 'core') {
                                entities.push(
                                    {
                                        e_id: null,
                                        e_name: 'LOPCO'
                                    }
                                )
                            }
                            items.push(
                                {
                                    image: key,
                                    type: value['type'],
                                    entities: entities
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(template, {items: items});
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }
}
