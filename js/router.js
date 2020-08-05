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

import routes from './routes.min.js'


const url_params = new URLSearchParams(window.location.search);
let main_element = document.getElementsByTagName("main")[0];


function getRoute(path) {
    let regex = '';
    let params = {};
    let i;
    for (i = 0; i < routes.length; i++) {
        regex = '^' + routes[i][0].replace(/\//g, '\\/');
        const path_vars = routes[i][0].match(/{.+?}/g);
        if (path_vars) {
            let j;
            for (j = 0; j < path_vars.length; j++) {
                regex = regex.replace(path_vars[j], '[\\w\\-]+');
            }
        }
        regex = regex + '\\/*$';
        if (path.match(regex)) {
            if (path_vars) {
                const p_items = path.split('/');
                const r_items = routes[i][0].split('/')
                let j;
                for (j = 0; j < path_vars.length; j++) {
                    params[path_vars[j].replace(/{|}/g, '')] = p_items[r_items.indexOf(path_vars[j])];
                }
            }
            return [routes[i], params];
        }
    }
    return null;
}

if (url_params.has('trgt')) {
    const route = getRoute(url_params.get('trgt'));
    document.addEventListener('DOMContentLoaded', (event) => {
        import('../components/' + route[0][1] + '/component.min.js')
            .then((cmp) => {
                let component = new cmp[route[0][2]](main_element);
                component.draw(route[1]);
            })
            .catch((err) => {
                main_element.innerHTML = err;
            })
    });
}