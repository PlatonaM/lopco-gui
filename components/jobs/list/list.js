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

    draw(api, h_toggle) {
        fetch(api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving jobs - ' + response.status;
            })
            .then((data) => {
                fetch('/components/jobs/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let items = [];
                        for (const [key, value] of Object.entries(data)) {
                            items.push(
                                {
                                    id: key,
                                    ds_id: value['ds_id'],
                                    status: value['status'],
                                    pipeline_id: value['pipeline_id'],
                                    created: value['created'],
                                    running: (value['status'] === 'running')
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(template, {jobs: items, history: h_toggle});
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }

    abort(job) {
        if (confirm('Abort Job ' + job + '?')) {
            fetch(active_cmp.constructor.jm_api + '/jobs/' + job, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({status: "aborted"})
            })
                .then(response => {
                    if (response.ok) {
                        alert('Job aborted successfully!');
                        window.open('/jobs','_self');
                    } else {
                        throw response.status;
                    }
                })
                .catch((error) => {
                    alert("Can't abort job: " + error);
                });
        }
    }
}
