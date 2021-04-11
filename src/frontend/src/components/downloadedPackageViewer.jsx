import React, {Component} from 'react';
import { Divider, Card, Col, Row, Space, Alert, Spin } from "antd";
import {Link} from "react-router-dom"
import { DeleteOutlined, CodeOutlined, DashboardOutlined, LoadingOutlined } from '@ant-design/icons';

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

    async componentDidMount()
    {
        this.getData();
    }

    render() { 

        return ( 
            <div> {this.state.res_json}
                <Row style={{ textAlign: 'left' }} gutter={25}>               
                    {Object.keys(this.state.packages.results).map((lang) => {
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
                                                            
                                                                <DeleteOutlined key="ellipsis" />,
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