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

    constructor(ctr) {
        this.container = ctr;
    }

    draw() {
        fetch(active_cmp.constructor.api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving images - ' + response.status;
            })
            .then((data) => {
                fetch('/components/system/images/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (let [key, value] of Object.entries(data)) {
                            items.push(
                                {
                                    name: key,
                                    hash: value['hash'],
                                    created: value['created'],
                                    size: Math.round((value['size'] / 1000000 + Number.EPSILON) * 100) / 100,
                                    architecture: value['architecture']
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
