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


function showSpinner() {
    let spinner = document.createElement('div');
    spinner.id = 'task-spinner';
    spinner.setAttribute('uk-spinner', 'ratio: 1');
    spinner.className = 'uk-flex uk-margin-auto-left uk-padding-small uk-margin-small-right';
    let container = document.getElementById('main-nav');
    container.appendChild(spinner);
}

function hideSpinner() {
    let spinner = document.getElementById('task-spinner');
    spinner.remove();
}
