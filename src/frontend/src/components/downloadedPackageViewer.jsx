import React, {Component} from 'react';
import { Divider, Card, Col, Row, Space, Alert, Spin, Empty } from "antd";
import {Link} from "react-router-dom"
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, CodeOutlined, DashboardOutlined, LoadingOutlined } from '@ant-design/icons';

const { Meta } = Card;

class DownloadedPackageViewer extends Component {
    state = { 
        packages: {
            status:"",
            results:{}
        }
     }

    async getData()
    {
        // /api/v1/packages
        let res = await fetch(`http://localhost:5000/api/v1/packages`,{ mode: 'cors'});
        if (res.status === 200)
        {
            let res_json = await res.json();
            await Object.keys(res_json.results).map((lang) => {
                return this.sortResults(res_json.results[lang]);
            }) 

            this.setState({
                packages: res_json
            });
        }
    }

    checkIfLicenseAllowed(licenses)
    {
        for (var j = 0; j < licenses.length; j++)
        {
            for (var i = 0; i < window.allowedLicences.length; i++) {
                if(licenses[j]?.indexOf(window.allowedLicences[i]) > -1) 
                {
                    return true;
                }
            }
        }
        return false;
    }

    async sortResults(results)
    {
      await results.sort((firstNode, secondNode) => {
        if(firstNode?.ERROR > secondNode?.ERROR || (firstNode?.ERROR && !secondNode?.ERROR)){return -1}
        if(firstNode?.WARNING > secondNode?.WARNING || (firstNode?.WARNING && !secondNode?.WARNING)){return -1}
        if(firstNode?.INFO > secondNode?.INFO){return -1} 
        if(firstNode?.ERROR < secondNode?.ERROR || (!firstNode?.ERROR && secondNode?.ERROR)){return 1}
        if(firstNode?.WARNING < secondNode?.WARNING || (!firstNode?.WARNING && secondNode?.WARNING)){return 1}
        if(firstNode?.INFO < secondNode?.INFO){return 1}
        return 0
      })
      return new Promise((resolve) => {resolve(results);})
    }

    async deleteScan(lang, packageId)
    {
        let res = await fetch(`http://localhost:5000/api/v1/delete/${lang}/${packageId}`,{ mode: 'cors'});
        if (res.status === 200)
        {
            this.getData();
        }
    }

    async componentDidMount()
    {
        this.getData();
    }

    render() { 

        return ( 
            <div> {this.state.res_json}
                <Row style={{ textAlign: 'left' }} gutter={25}>               
                    {Object.keys(this.state.packages.results).map((lang) => {
                        if (this.state.packages.results[lang].length === 0){
                            return (
                                <Col span={24 / Object.keys(this.state.packages.results).length}>
                                    <Divider orientation="left">{lang}</Divider>
                                    <Empty description={
                                    <span>
                                    No Scans
                                    </span>
                                    }/>
                                </Col>)
                        }

                        return (                
                                <Col span={24 / Object.keys(this.state.packages.results).length}>
                                        <Divider orientation="left">{lang}</Divider>
                                        <Space size={12} direction="vertical" style={{ width: "100%" }}>
                                        {this.state.packages.results[lang].map((packageResult) => {
                                                return (
                                                        <Card 
                                                            actions={[                                                                
                                                                (<Link key={`dashboard-${packageResult.package}`} to={`/results/${lang}/${packageResult.package.substring(0,packageResult.package.lastIndexOf('-'))}/${packageResult.package.substring(packageResult.package.lastIndexOf('-')+1)}`}>
                                                                <DashboardOutlined key="edit" />
                                                                </Link>),
                                                                (<Link key={`sourceviewer-${packageResult.package}`} to={`/sourceviewer/${lang}/${packageResult.package}`}>
                                                                <CodeOutlined key="setting" />
                                                                </Link>),
                                                                <DeleteOutlined key="ellipsis" onClick={() => {if(packageResult?.status !== "loading"){this.deleteScan(lang, packageResult.package)}}}/>,
                                                            ]}
                                                        >
                                                            <Meta
                                                            title={
                                                                <Row>
                                                                    <Col>{packageResult.package}</Col>
                                                                    <Col style={{position:"absolute",right:20, top:"10%",marginTop:"auto"}}>
                                                                        <Space direction="horizontal">
                                                                            {packageResult?.ERROR ? <Alert style={{width: "max-content"}} showIcon message={packageResult.ERROR} type="error"/>: undefined }
                                                                            {packageResult?.WARNING ? <Alert style={{width: "max-content"}} showIcon message={packageResult.WARNING} type="warning"/>: undefined }
                                                                            {packageResult?.INFO ? <Alert style={{width: "max-content"}} showIcon message={packageResult.INFO} type="info"/>: undefined }
                                                                            {packageResult?.status === "loading" ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>}/>: undefined }
                                                                        </Space>
                                                                    </Col>
                                                                </Row>}
                                                            description = {
                                                                this.checkIfLicenseAllowed(packageResult?.licenses) ? 
                                                                (<span><CheckCircleTwoTone twoToneColor="#52c41a" /> {packageResult?.licenses.toString()}</span>):
                                                                (<span><CloseCircleTwoTone twoToneColor="#eb2f2f" /> {packageResult?.licenses.toString()}</span>)                                                            
                                                            }                                                            
                                                            />
                                                        </Card>
                                                )
                                            })}
                                        </Space>
                                </Col>     
                        )
                    })}
                </Row>
            </div> 
         );
    }
}
 
export default DownloadedPackageViewer;