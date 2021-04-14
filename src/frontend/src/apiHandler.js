const apiHost = "http://localhost:5000";

async function constructURL(apiPath, parameters = {})
{
    var url = new URL(apiHost);
    url.pathname = apiPath;
    await Object.keys(parameters).map((key) => {
        url.searchParams.set(key, parameters[key]);
    })
    return new Promise((resolve) => (resolve(url.href)));
}

async function getJson(apiURL)
{
    var res = await fetch(apiURL,{ mode: 'cors'});
    if (res.status === 200)
    {
        let res_json = await res.json();
        return new Promise((resolve) => (resolve(res_json)));
    }
    return new Promise((reject) => (reject(res.status)));
} 


export async function fetchScan(lang, packageName, version = "latest")
{
    var url = await constructURL(`api/v1/${lang}`,{package_name: packageName, version: version});
    var jsonResponse = await getJson(url);
    return new Promise((resolve) => (resolve(jsonResponse)));
}

export async function fetchFileTreeData(lang, packageId)
{
    var url = await constructURL(`api/v1/sourceview`,{lang: lang, package_id: packageId});
    var jsonResponse = await getJson(url);
    return new Promise((resolve) => (resolve(jsonResponse)));
}

export async function fetchFileData(path)
{
    var url = await constructURL(`api/v1/file`,{path: path});
    var jsonResponse = await getJson(url);
    return new Promise((resolve) => (resolve(jsonResponse)));
}

export async function fetchPackagesData()
{
    var url = await constructURL(`api/v1/packages`);
    var jsonResponse = await getJson(url);
    return new Promise((resolve) => (resolve(jsonResponse)));
}

export async function deleteScanRequest(lang, packageId)
{
    var url = await constructURL(`api/v1/delete`,{lang: lang, package_id: packageId});
    var jsonResponse = await getJson(url);
    return new Promise((resolve) => (resolve(jsonResponse)));
}

export async function Test()
{
    var a = await constructURL("api/v1/packages",{package:"asdsad",version:"2.1"})
    return new Promise((resolve) => (resolve(a)));
}