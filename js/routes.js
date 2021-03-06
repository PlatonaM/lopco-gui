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

export { routes as default }


const routes = [
    ['/jobs', 'jobs', 'Jobs'],
    ['/jobs/{job}', 'jobs', 'Jobs'],
    ['/pipelines', 'pipelines', 'Pipelines'],
    ['/pipelines/{pl}', 'pipelines', 'Pipelines'],
    ['/data-sources', 'data-sources', 'DataSources'],
    ['/data-sources/{ds}', 'data-sources', 'DataSources'],
    ['/workers', 'workers', 'Workers'],
    ['/workers/{wk}', 'workers', 'Workers'],
    ['/protocol-adapters', 'protocol-adapters/registry', 'Registry'],
    ['/protocol-adapters/registry/{pa}', 'protocol-adapters/registry', 'Registry'],
    ['/protocol-adapters/deployments', 'protocol-adapters/deployments', 'Deployments'],
    ['/protocol-adapters/deployments/{pa}', 'protocol-adapters/deployments', 'Deployments'],
    ['/system', 'system/services', 'Services'],
    ['/system/services/{srv}', 'system/services', 'Services'],
    ['/system/images', 'system/images', 'Images'],
    ['/system/updates', 'system/updates', 'Updates'],
    ['/system/backups', 'system/backups', 'Backups']
];
