import React, { Component } from "react";
import { Radio, Input, Card, Space } from 'antd';
import { Button } from 'antd';

class NewScan extends Component {
    state = {
        loading: 0,
        radioState: "npm",

      };
    
    enterLoading = index => {
        let packages = document.querySelector("#packages_input").value.split(",")
        
        this.stateChange("loading", 1);
        setTimeout(() => {this.stateChange("loading", 0);document.location = `/dashboard/${this.state.radioState}`}, 2000);
        let lang = this.state.radioState
        packages.forEach(function(packages_node, idx, array){
            console.log(lang)
            if (packages_node.indexOf("@") > -1)
            {
                var [package_name, version] = packages_node.split("@");
            }
            else
            {
                version = "latest";
                package_name = packages_node;
            }
            if (array.length === 1)
            {
                document.location = `results/${lang}/${package_name.trim()}/${version.trim()}`;
            } 
            fetch(`http://localhost:5000/api/v1/${lang}/${package_name.trim()}/${version.trim()}`,{ mode: 'cors'});
        });
        console.log(document.querySelector("#packages_input").value)  
    };

    stateChange = (key,val) => {
        this.setState({
            [key]: val,
        });
    }

    render() {     
        const onLangChange = e => {
            this.stateChange("radioState",e.target.value);
        };

        const { loading } = this.state;
        return ( 
            
            <Card  style={{marginLeft:"auto", marginRight:"auto", textAlign:"center" ,width: "50%"}}>
                <h1 style={{fontSize:45}}>New Scan</h1>
                <Space size={30} style={{width:"100%"}} direction="vertical">
                    <Radio.Group style={{"position": "absolute", "left": "25px"}} onChange={onLangChange} value={this.state.radioState}>
                        <Radio value="npm">NPM</Radio>
                        <Radio value="pip">PIP</Radio>
                    </Radio.Group>
                    <Input placeholder="Packages" id="packages_input"/>
                    <Button type="primary" loading={loading} onClick={() => this.enterLoading()}>
                        Submit
                    </Button>
                </Space>
            </Card>
         );
    }
}
 
export default NewScan;