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
                throw 'Error retrieving workers - ' + response.status;
            })
            .then((data) => {
                fetch('/components/workers/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (let [key, value] of Object.entries(data)) {
                            value = JSON.parse(value);
                            items.push(
                                {
                                    id: key,
                                    name: value['name'],
                                    image: value['image'],
                                    description: value['description']
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(template, {ds_items: items});
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }

    delete(id) {
        if (confirm('Delete ' + id + '?')) {
            fetch(active_cmp.constructor.api + '/' + id, {method: 'DELETE'})
                .then((response) => {
                    if (response.ok) {
                        window.open('/workers','_self');
                    } else {
                        throw response.status;
                    }
                })
                .catch((err) => {
                    alert('Error deleting ' + id + ' - ' + err);
                })
        }
    }
}