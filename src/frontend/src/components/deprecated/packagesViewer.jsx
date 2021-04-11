import React, {Component} from 'react';
import { Divider, Card, Col, Row, Space } from "antd";
import {Link} from "react-router-dom"

class PackagesViewer extends Component {
    state = { 
        packages: {}
     }


     async getData()
    {
        // /api/v1/packages
        let res = await fetch(`http://localhost:5000/api/v1/packages`,{ mode: 'cors'});
        if (res.status === 200)
        {
            let res_json = await res.json();

            this.setState({
                packages: res_json
            });
        }
    }
    async componentDidMount()
    {
        this.getData();
    }

    render() { 

        return ( 
            <div>
                <Row style={{ textAlign: 'left' }} gutter={25}>               
                    {Object.keys(this.state.packages).map((lang) => {
                        return (                
                                <Col span={24 / Object.keys(this.state.packages).length}>
                                        <Divider orientation="left">{lang}</Divider>
                                        <Space size={12} direction="vertical" style={{ width: "100%" }}>
                                            {
                                            this.state.packages[lang].map((packageId) => {
                                                return (
                                                    <Link key={packageId} to={`/sourceviewer/${lang}/${packageId}`}>
                                                        <Card hoverable>
                                                            <h4>{packageId}</h4>
                                                        </Card>
                                                    </Link>
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
 
export default PackagesViewer;