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

export { Services }

import { List } from './list/list.min.js'
import { Details } from "./details/details.min.js";


class Services {
    static api = '/api/deployment-manager/deployments';

    constructor(ctr) {
        this.loadStyle();
        this.list = new List(ctr);
        this.details = new Details(ctr);
    }

    loadStyle() {
        let element = document.createElement("link");
        element.href = "/components/system/services/style.css";
        element.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(element);
    }

    draw(sp, {srv}) {
        if (!sp && !srv) {
            return this.list.draw();
        }
        if (sp && srv && sp.has('action') && sp.get('action') === 'details') {
            return this.details.draw(srv);
        }
    }


}
