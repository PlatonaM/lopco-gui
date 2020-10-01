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

    draw(ds) {
        fetch(active_cmp.constructor.mr_api + "/" + ds)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving data-source - ' + response.status;
            })
            .then((data) => {
                fetch('/components/data-sources/details/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: ds,
                                name: data['name'],
                                type_id: data['type_id'],
                                pipeline_id: data['pipeline_id']
                            }
                        );
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }
}