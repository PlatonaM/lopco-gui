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

export {DataSources}

import { List } from './list/list.min.js'
import { Form } from './form/form.min.js'


class DataSources {

    constructor(ctr) {
        this.list = new List(ctr);
        this.form = new Form(ctr);
    }

    draw(sp, {ds}) {
        if (!sp && !ds) {
            return this.list.draw();
        }
        if (sp && !ds && sp.has('action') && sp.get('action') === 'new') {
            return this.form.draw();
        }
        if (sp && ds && sp.has('action') && sp.get('action') === 'edit') {
            return this.form.drawEdit(ds);
        }
    }

}