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

    genFields(items) {
        let fields = [];
        let null_fields = [];
        let x;
        for (x = 0; x < items.length; x++) {
            try {
                for (const [key, value] of Object.entries(items[x])) {
                    fields.push(
                        {
                            field: key,
                            f_value: value
                        }
                    );
                }
            } catch (err) {
                null_fields.push({field: 'null'});
            }
        }
        return [fields, null_fields];
    }

    draw(api, j_id) {
        fetch(api + '/' + j_id)
            .then((response) => response.json())
            .then((data) => {
                fetch('/components/jobs/details/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let stages = [];
                        let i;
                        for (i = 0; i < data['stages'].length; i++) {
                            const gen_fields = this.genFields(data['stages'][i]['outputs'])
                            stages.push(
                                {
                                    stage: data['stages'][i]['id'],
                                    fields: gen_fields[0],
                                    null_fields: gen_fields[1]
                                }
                            );
                        }
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: j_id,
                                created: data['created'],
                                status: data['status'],
                                ds_id: data['machine_id'],
                                pipeline_id: data['pipeline_id'],
                                stages: stages
                            }
                        );
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }
}