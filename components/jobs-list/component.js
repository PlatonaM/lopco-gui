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

export { Active, History }

class JobsList {
    constructor(ctr) {
        this.loadStyle();
        this.container = ctr;
        this.api = 'http://localhost:8000/job-manager/'
    }

    loadStyle() {
        let element = document.createElement("link");
        element.href = "/components/jobs-list/style.css";
        element.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(element);
    }

    draw(endpoint, path, st_sort=false) {
        fetch(this.api + endpoint)
            .then((response) => response.json())
            .then((data) => {
                fetch('/components/jobs-list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (const [key, value] of Object.entries(data)) {
                            items.push(
                                {
                                    id: key,
                                    ds_id: value['machine_id'],
                                    status: value['status'],
                                    pipeline_id: value['pipeline_id'],
                                    created: value['created']
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(template, {jobs: items, path: path, st_sort: st_sort});
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }
}

class Active extends JobsList {
    constructor(ctr) {
        super(ctr);
    }

    draw() {
        super.draw('jobs', 'active');
    }
}

class History extends JobsList {
    constructor(ctr) {
        super(ctr);
    }

    draw() {
        super.draw('history', 'history', true);
    }
}