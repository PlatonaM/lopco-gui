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

const url_params = new URLSearchParams(window.location.search);

if (url_params.has('trgt')) {
    document.addEventListener('DOMContentLoaded', (event) => {
        let parent_items = document.getElementById("main-nav").getElementsByClassName("uk-parent");
        for (let i = 0; i < parent_items.length; i++) {
            let nav_items = parent_items[i].getElementsByTagName("li");
            for (let x = 0; x < nav_items.length; x++) {
                if (nav_items[x].firstChild.href.includes(url_params.get('trgt'))) {
                    nav_items[x].className += " uk-active";
                    parent_items[i].className += " uk-active";
                    return null;
                }
            }
        }
    });
}