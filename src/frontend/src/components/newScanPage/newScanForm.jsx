import React, { useState } from "react";
import { Radio, Input, Card, Space } from 'antd';
import { message, Button } from 'antd';
import { fetchScan } from "../../apiHandler.js";

function NewScanForm()
{   
    const [loading, setLoading] = useState(false);
    const [radioState, setRadioState] = useState("npm");

    const onLangChange = e => {
        setRadioState(e.target.value);
    };

    const showLoadingMessage = (messageText, duration) =>
    {
        const hide = message.loading(messageText, 0);
        setTimeout(hide, duration);
    }

    const scan = async () => {
        let packages = document.querySelector("#packages_input").value.split(",");
        setLoading(true);
        var version, packageName;
        await packages.forEach(function(packagesNode){
            if (packagesNode.lastIndexOf("@") > 0)
            {
                if (packagesNode.indexOf("@") === 0) 
                {
                    [,packageName, version] = packagesNode.split("@");
                    packageName = "@"+packageName;
                }
                else
                {
                    [packageName, version] = packagesNode.split("@");
                }
            }
            else
            {
                version = "latest";
                packageName = packagesNode;
            }
            fetchScan(radioState, packageName.trim(), version.trim());
            showLoadingMessage(`Scanning ${packageName.trim()} - ${version.trim()}`, 2500);
        });
        setLoading(false);
    };

    return (             
        <Card  style={{marginLeft:"auto", marginRight:"auto", textAlign:"center" ,width: "50%"}}>
            <h1 style={{fontSize:45}}>New Scan</h1>
            <Space size={30} style={{width:"100%"}} direction="vertical">
                <Radio.Group style={{"position": "absolute", "left": "25px"}} onChange={onLangChange} value={radioState}>
                    <Radio value="npm">NPM</Radio>
                    <Radio value="pip" disabled>PIP</Radio>
                </Radio.Group>
                <Input placeholder="Packages" id="packages_input"/>
                <Button type="primary" loading={loading} onClick={() => scan()}>
                    Submit
                </Button>
            </Space>
        </Card>
     );
}

export default NewScanForm;