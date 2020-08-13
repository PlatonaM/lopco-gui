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


function getRoute(path) {
    let regex = '';
    let path_vars = {};
    let i;
    for (i = 0; i < routes.length; i++) {
        regex = '^' + routes[i][0].replace(/\//g, '\\/');
        const pv_placeholders = routes[i][0].match(/{.+?}/g);
        if (pv_placeholders) {
            let j;
            for (j = 0; j < pv_placeholders.length; j++) {
                regex = regex.replace(pv_placeholders[j], '[\\w\\-]+');
            }
        }
        regex = regex + '\\/*$';
        if (path.match(regex)) {
            if (pv_placeholders) {
                const p_items = path.split('/');
                const r_items = routes[i][0].split('/')
                let j;
                for (j = 0; j < pv_placeholders.length; j++) {
                    path_vars[pv_placeholders[j].replace(/{|}/g, '')] = p_items[r_items.indexOf(pv_placeholders[j])];
                }
            }
            return [routes[i], path_vars];
        }
    }
    return null;
}

const url = new URL(window.location);
const route = getRoute(url.pathname);
let main_element = document.getElementsByTagName("main")[0];

if (route) {
    document.addEventListener('DOMContentLoaded', (event) => {
        import('../components/' + route[0][1] + '/component.min.js')
            .then((cmp) => {
                window.active_cmp = new cmp[route[0][2]](main_element);
                window.active_cmp.draw((url.search) ? url.searchParams : undefined, route[1]);
            })
            .catch((err) => {
                main_element.innerHTML = err;
            })
    });
} else {
    main_element.innerHTML = 'Page not found.';
}