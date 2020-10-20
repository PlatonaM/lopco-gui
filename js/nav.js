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


if (window.location.pathname) {
    document.addEventListener('DOMContentLoaded', (event) => {
        let nav_items = document.getElementById("main-nav").getElementsByTagName('li');
        let i;
        for (i = 0; i < nav_items.length; i++) {
            if (window.location.href.includes(nav_items[i].firstElementChild.href)) {
                nav_items[i].className += " uk-active";
            }
        }
    });
}
