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
        this.loadStyle();
        this.container = ctr;
    }

    loadStyle() {
        let element = document.createElement("link");
        element.href = "/components/protocol-adapters/deployments/list/style.css";
        element.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(element);
    }

    draw() {
        fetch(active_cmp.constructor.api + '?type=protocol-adapter')
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving deployments - ' + response.status;
            })
            .then((data) => {
                fetch('/components/protocol-adapters/deployments/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (let [key, value] of Object.entries(data)) {
                            items.push(
                                {
                                    id: key,
                                    pa_id: value['labels']['lopco-id'],
                                    image: value['image']['name'],
                                    hash: value['image']['hash'],
                                    status: value['status']
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(template, {pa_items: items});
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
                        window.open('/protocol-adapters/deployments','_self');
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