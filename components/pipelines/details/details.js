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

    draw(p_id) {
        fetch(active_cmp.constructor.api + '/' + p_id)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving Pipeline - ' + response.status;
            })
            .then((data) => {
                fetch('/components/pipelines/details/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        let stages = [];
                        let i;
                        for (i=0; i < Object.keys(data['stages']).length; i++) {
                            let i_map = [];
                            for (let [key, value] of Object.entries(data['stages'][i]['input_map'])) {
                                i_map.push(
                                    {
                                        field: key,
                                        f_value: value
                                    }
                                )
                            }
                            let configs = [];
                            if (data['stages'][i]['worker']['configs']) {
                                for (let [key, value] of Object.entries(data['stages'][i]['worker']['configs'])) {
                                    configs.push(
                                        {
                                            field: key,
                                            f_value: value
                                        }
                                    )
                                }
                            }
                            stages.push(
                                {
                                    st_num: i,
                                    description: data['stages'][String(i)]['description'],
                                    w_name: data['stages'][String(i)]['worker']['name'],
                                    w_id: data['stages'][String(i)]['worker']['id'],
                                    inputs: i_map,
                                    has_output: !!(data['stages'][i]['worker']['output']),
                                    outputs: (data['stages'][i]['worker']['output']) ? data['stages'][i]['worker']['output']['fields'] : null,
                                    has_config: !!(data['stages'][i]['worker']['configs']),
                                    configs: configs
                                }
                            )
                        }
                        this.container.innerHTML = Mustache.render(
                            template,
                            {
                                id: p_id,
                                name: data['name'],
                                stage_length: Object.keys(data['stages']).length,
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