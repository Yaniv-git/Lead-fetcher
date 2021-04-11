import React, { Component } from "react";
import { Tabs, Spin, Empty, Button, Space, Card, Divider, Row, Col, Alert} from 'antd';
import {Link} from "react-router-dom"
import npmLogo from "../pictures/npm-logo.png"
import { RightOutlined, LoadingOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

class Dashboard extends Component {
    state = {
        statistic: {
          status:"loading",
          message:"No data",
          results:[{},{},{},{}]
        }
      };


    async getData()
    {
      let res = await fetch(`http://localhost:5000/api/v1/dashboard/${this.props.match.params.lang}`,{ mode: 'cors'});
      if (res.status === 200)
          {

            let res_json = await res.json();
            res_json.results = await this.sortResults(res_json.results);

            this.setState({
              statistic: res_json
            });
          }
      else
      {
            this.setState({
              statistic:{status:"error",message:res.statusText}
            });
      }
      
    }

    stateChange = (key,val) => {
        this.setState({
            [key]: val,
        });
      }

    componentDidMount(){
      this.getData()
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
      
    render() {     
        if(this.state.statistic.status === "error")
        {
          return (  
              <div>
                <Empty description={
                  <span>
                    No data
                  </span>
                }/>
                <Button><Link to='/scan'>scan</Link></Button>
              </div>
            );
        }
        

        return ( 
          <div>
            <Tabs >
            <TabPane tab="NPM" key="1">

            <Divider orientation="left"><img alt="" width="55px" src={npmLogo}/></Divider>

            <Space style={{width:"100%"}} size={30} direction="vertical"> 
              {
                this.state.statistic.results.map((scan) => {
                  const packageName = scan?.package?.substring(0, scan?.package?.lastIndexOf("-"));
                  const packageVersion = scan?.package?.split('-').slice(-1)[0];
                  
                  return (
                  
                  <Link key={`${packageName}-${packageVersion}`} to={`/results/npm/${packageName}/${packageVersion}`}>
                    <Card hoverable loading={this.state.statistic.status === "loading"}>
                      <Row>
                        <Col>
                          <Button type="text" icon={<RightOutlined />}></Button>
                          <b style={{fontSize:18,textAlign:"left"}}>{scan?.package}</b>
                        </Col>
                        <Col style={{position:"absolute",right:20, top:"25%",marginTop:"auto"}}>
                          <Space direction="horizontal">
                            
                            {scan?.ERROR ? <Alert style={{width: "max-content"}} showIcon message={scan.ERROR} type="error"/>: undefined }
                            {scan?.WARNING ? <Alert style={{width: "max-content"}} showIcon message={scan.WARNING} type="warning"/>: undefined }
                            {scan?.INFO ? <Alert style={{width: "max-content"}} showIcon message={scan.INFO} type="info"/>: undefined }
                            {scan?.status === "loading" ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>}/>: undefined }

                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  </Link>
                )})
              }
            </Space>
            </TabPane>
            <TabPane tab="PIP" key="2">
              <p>Content of Tab Pane 2</p>
              <p>Content of Tab Pane 2</p>
              <p>Content of Tab Pane 2</p>
            </TabPane>

          </Tabs>
          </div>
         );
    }
}
 
export default Dashboard;