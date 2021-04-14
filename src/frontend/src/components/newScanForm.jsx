import React, { useState } from "react";
import { Radio, Input, Card, Space } from 'antd';
import { message, Button } from 'antd';
import { fetchScan } from "../apiHandler.js";

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

        await packages.forEach(function(packages_node){
            if (packages_node.indexOf("@") > 0)
            {
                var [package_name, version] = packages_node.split("@");
            }
            else
            {
                version = "latest";
                package_name = packages_node;
            }
            fetchScan(radioState, package_name.trim(), version.trim());
            showLoadingMessage(`Scanning ${package_name.trim()} - ${version.trim()}`, 2500);
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