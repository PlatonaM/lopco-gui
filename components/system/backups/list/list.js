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

    static type_map = {
        'worker': '/workers',
        'protocol-adapter': '/protocol-adapters/registry'
    }

    constructor(ctr) {
        this.container = ctr;
    }

    draw() {
        fetch(active_cmp.constructor.api)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw 'Error retrieving backups - ' + response.status;
            })
            .then((data) => {
                fetch('/components/system/backups/list/template.html')
                    .then((response) => response.text())
                    .then((template) => {
                        this.container.innerHTML = Mustache.render(template, {items: data});
                    });
            })
            .catch((err) => {
                this.container.innerHTML = err
            });
    }

    create() {
        showSpinner();
        fetch(active_cmp.constructor.api,{method: 'PATCH'})
            .then((response) => {
                if (response.ok) {
                    window.open('/system/backups','_self');
                } else {
                    throw response.status;
                }
            })
            .catch((err) => {
                hideSpinner();
                alert('Error creating backup - ' + err);
            })
    }

    import() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json'
        input.onchange = event => {
            let file = event.target.files[0];
            if (file.type !== input.accept) {
                alert("Error importing backup - wrong content type '" + file.type + "'")
                return
            }
            showSpinner();
            fetch(active_cmp.constructor.api, {method: 'POST', body: file})
                .then((response) => {
                    if (response.ok) {
                        window.open('/system/backups','_self');
                    } else {
                        throw response.status;
                    }
                })
                .catch((err) => {
                    hideSpinner();
                    alert('Error importing backup - ' + err);
                })
        }
        input.click();
    }

    delete(backup) {
        if (confirm('Delete ' + backup + '?')) {
            showSpinner();
            fetch(active_cmp.constructor.api + '/' + backup, {method: 'DELETE'})
                .then((response) => {
                    if (response.ok) {
                        window.open('/system/backups','_self');
                    } else {
                        throw response.status;
                    }
                })
                .catch((err) => {
                    hideSpinner();
                    alert('Error deleting backup "' + backup + '" - ' + err);
                })
        }
    }

    apply(backup) {
        if (confirm('Apply ' + backup + '?')) {
            showSpinner();
            fetch(active_cmp.constructor.api + '/' + backup, {method: 'PATCH'})
                .then((response) => {
                    if (response.ok) {
                        window.open('/system/backups','_self');
                    } else {
                        throw response.status;
                    }
                })
                .catch((err) => {
                    hideSpinner();
                    alert('Error applying backup "' + backup + '" - ' + err);
                })
        }
    }
}
